import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson } from "../util/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const GetGroups: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson
): Promise<void> {
  try {
    const id = user.id;
    await mongooseConnection();
    if (user.role === "USER") {
      context.res = {
        body: await Group.find({ people: id }),
      };
    } else if (user.role === "ADMIN") {
      context.res = {
        body: await Group.find({}),
      };
    }
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(GetGroups, userPerm);
