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
    validateId({ id });

    await mongooseConnection();
    const group = await Group.findById(id).populate("people");

    if (user.role === "USER") {
      const userGroups = await Group.find({ people: user.id });
      if (
        !userGroups.some((userGroup) => `${userGroup._id}` === `${group._id}`)
      )
        throw errors.noPermissionErr;
    }

    context.res = {
      body: group,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
