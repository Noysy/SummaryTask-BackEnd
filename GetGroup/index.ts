import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { authWrapper, userPerm } from "../Util/authorization";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId({ id: id });

    const group = await Group.findOne({ _id: id });

    if (group === null) throw errors.noGroupErr;
    if (!group.people.includes(user.id)) throw errors.noPermissionErr;

    await mongooseConnection();
    context.res = {
      body: group,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
