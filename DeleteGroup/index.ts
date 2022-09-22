import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    await mongooseConnection();

    const deletedGroup = await Group.findByIdAndDelete(id);

    if (deletedGroup === null)
      throw new notFoundError("group");

    await Group.updateMany(
      { parentGroup: id },
      { $unset: { parentGroup: 1 } }
    );

    context.res = {
      body: deletedGroup,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
