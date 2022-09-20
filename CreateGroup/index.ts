import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { IGroup, groupRequirements, Group } from "../Group/group.interface";
import { DBPerson } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const group: IGroup = {
      name: req.body?.name,
      people: req.body?.people,
      parentGroup: req.body?.parentGroup,
    };
    const validation = groupRequirements.validate(group);
    if (validation.error) throw new CustomError(validation.error.message, 400);

    await mongooseConnection();

    context.res = {
      status: 200,
      body: await Group.create(group),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
