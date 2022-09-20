import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import configFile, { errors } from "../config";
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
    const id = context.bindingData.id;
    validateId({ id: id });
    await mongooseConnection();

    const group = await Group.findOne({ _id: id });
    if (group === null) throw errors.noGroupErr;
    if (!group.people.includes(user.id) && user.role === "USER")
      throw errors.noPermissionErr;

    context.res = {
      status: 200,
      body: await Group.find({ parentGroup: id }).select({
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
