import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { IPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import Group from "../util/group.model";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id, parentId } = context.bindingData;
    validateId(id);
    validateId(parentId);

    await mongooseConnection();
    const group = await Group.findById(id);

    if (!group) throw new notFoundError("group");

    if (id === parentId)
      throw new validationError("A group can't be its own parent.");

    if (!(await Group.findById(parentId))) throw new notFoundError("group");

    if (group.parentGroup) {
      throw new validationError("The group already has a parent");
    }

    const hasPrecedingParent = async (
      groupId: string,
      parentGroup: string
    ): Promise<boolean> => {
      if (groupId === parentGroup) return true;

      const parent = await Group.findById(parentGroup);

      if (parent && parent.parentGroup)
        return hasPrecedingParent(groupId, String(parent?.parentGroup));
      return false;
    };

    if (await hasPrecedingParent(id, parentId))
      throw new validationError("A group can't be it's own preceding parent");

    group.parentGroup = parentId;
    await group.save();
    context.res = {
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
