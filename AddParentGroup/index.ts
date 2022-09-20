import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/custom.error";
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

    if (group === null) throw errors.noGroupErr;

    if (id === parentId)
      throw new CustomError("A group can't be its own parent.", 400);

    if ((await Group.findOne({ _id: parentId })) === null)
      throw errors.noGroupErr;

    if (group.parentGroup) {
      throw new CustomError("The group already has a parent", 400);
    }

    const checkPrecedingParent = async (id: string, parentGroup: string) => {
      if (id === parentGroup) return null;

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

        await checkPrecedingParent(id, String(parent?.parentGroup));
      } else return false;
    };

    if ((await checkPrecedingParent(id, parentId)) === undefined)
      throw new CustomError("A group can't be it's own preceding parent", 400);

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
