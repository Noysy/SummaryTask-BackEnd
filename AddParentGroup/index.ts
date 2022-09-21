import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import { notFoundError, validationError } from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id, parentId } = context.bindingData;
    validateId({ id });
    validateId({ id: parentId });

    await mongooseConnection();
    const group = await Group.findOne({ _id: id });

    if (group === null) throw new notFoundError("group");

    if (id === parentId)
      throw new validationError("A group can't be its own parent.");

    if ((await Group.findOne({ _id: parentId })) === null)
      throw new notFoundError("group");

    if (group.parentGroup) {
      throw new validationError("The group already has a parent");
    }

    const checkPrecedingParent = async (groupId: string, parentGroup: string) => {
      if (groupId === parentGroup) return false;

      if (
        await Group.findOne({
          _id: parentGroup,
          parentGroup: { $exists: true },
        })
      ) {
        const parent = await Group.findById(parentGroup, {
          parentGroup: 1,
          _id: 0,
        });

        await checkPrecedingParent(groupId, String(parent?.parentGroup));
      } else return false;
    };

    if ((await checkPrecedingParent(id, parentId)) === undefined)
      throw new validationError("A group can't be it's own preceding parent");

    context.res = {
      status: 200,
      body: await Group.findByIdAndUpdate(
        id,
        { parentGroup: parentId },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
