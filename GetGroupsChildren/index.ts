import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { authWrapper, userPerm } from "../Util/authorization";
import { noPermissionError, notFoundError } from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId({ id });
    await mongooseConnection();

    const group = await Group.findById(id);

    if (!group) throw new notFoundError("group");

    if (!group.people.includes(user.id) && user.role === "USER")
      throw new noPermissionError();

    const getGroupsChildren = async (groupId: string) => {
      const children = await Group.find({ parentGroup: groupId });

      if (children)
        return Promise.all(
          children.map(async (child) => ({
            ...child.toJSON(),
            children: await getGroupsChildren(child.id),
          }))
        );

      return children;
    };

    const hierarchy = { ...group.toJSON(), children: await getGroupsChildren(id) };

    context.res = {
      status: 200,
      body: hierarchy,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
