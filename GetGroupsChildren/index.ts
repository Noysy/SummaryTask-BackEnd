import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { IPerson } from "../util/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError, notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import Group from "../util/group.model";
import mongooseConnection from "../util/mongoose.connection";
import { validateId } from "../util/joi";

const GetGroupsChildren: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    await mongooseConnection();

    const group = await Group.findById(id).exec();

    if (!group) throw new notFoundError("group");

    if (!group.people.includes(user.id) && user.role === "USER")
      throw new noPermissionError("an admin");

    const getGroupsChildren = async (groupId: string) => {
      const children = await Group.find({ parentGroup: groupId }).exec();

      if (children)
        return Promise.all(
          children.map(async (child) => ({
            ...child.toJSON(),
            children: await getGroupsChildren(child.id),
          }))
        );

      return children;
    };

    const hierarchy = {
      ...group.toJSON(),
      children: await getGroupsChildren(id),
    };

    context.res = {
      body: hierarchy,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(GetGroupsChildren, userPerm);
