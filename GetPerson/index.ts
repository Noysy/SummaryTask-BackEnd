import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { DBPerson, MyPerson, validateId } from "../Person/person.interface";
import { authWrapper, userPerm } from "../Util/authorization";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id });
    if (!id === id && user.role === "USER") throw errors.noPermissionErr;

    await mongooseConnection();
    const person = await MyPerson.findOne({ _id: id });
    if (person === null) throw errors.noPersonErr;

    context.res = {
      body: person,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
