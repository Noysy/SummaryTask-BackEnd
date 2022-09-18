import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import configFile from "../config";
import GroupManager from "../Group/GroupManager";
import { DBPerson, validateId } from "../Person/PersonInterface";
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
    validateId({ id: id });
    const group = await GroupManager.getGroup(id);
    if (!group.people.includes(user.id) && user.role === 'USER') throw configFile.noPermissionErr;

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
