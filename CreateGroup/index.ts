import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { IGroup, groupRequirements } from "../util/group.interface";
import { IPerson } from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import Group from "../util/group.model";
import mongooseConnection from "../util/mongoose.connection";

const CreateGroup: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const validation = groupRequirements.validate(req.body);
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();

    context.res = {
      status: 201,
      body: await Group.create(req.body),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(CreateGroup, adminPerm);
