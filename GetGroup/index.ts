import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../group/group.interface";
import { DBPerson, validateId } from "../person/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError, notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    const group = await Group.findOne({ _id: id });

    if (group === null) throw new notFoundError("group");
    if (!group.people.includes(user.id)) throw new noPermissionError();

    await mongooseConnection();
    context.res = {
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
