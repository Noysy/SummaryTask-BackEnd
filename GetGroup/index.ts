import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { MyGroup } from "../Group/GroupInterface";
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

    const group = await MyGroup.findOne({ _id: id });

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
