import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/group.interface";
import { DBPerson } from "../Person/person.interface";
import { authWrapper, userPerm } from "../Util/authorization";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const id = user.id;
    await mongooseConnection();
    if (user.role === "USER") {
      context.res = {
        body: await MyGroup.find({ people: id }),
      };
    } else if (user.role === "ADMIN") {
      context.res = {
        body: await MyGroup.find({}),
      };
    }
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
