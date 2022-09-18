import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import configFile from "../config";
import { DBPerson, validateId } from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
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
    context.res = {
      body: await PersonManager.getPerson(id),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
