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

    const group = await Group.findOne({ _id: id });
    if (group === null) throw new notFoundError("group");
    if (!group.people.includes(user.id) && user.role === "USER")
      throw new noPermissionError();

    context.res = {
      status: 200,
      body: await Group.find({ parentGroup: id }).select({
        people: 1,
        name: 1,
      }),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
