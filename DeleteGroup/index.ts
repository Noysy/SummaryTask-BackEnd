import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../group/group.interface";
import { DBPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
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
      status: 200,
      body: deletedGroup,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
