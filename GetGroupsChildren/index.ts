import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import configFile from "../config";
import { MyGroup } from "../Group/GroupInterface";
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
    await mongooseConnection();

    if (!(await GroupManager.getGroup(id)).people.includes(user.id) && user.role === 'USER') throw configFile.noPermissionErr;

    context.res = {
      status: 200,
      body: await MyGroup.find({ parentGroup: id }).select({
        people: 1,
        name: 1,
      }),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
