import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });
    await mongooseConnection();

    const deletedGroup = await Group.findByIdAndDelete(id);

    if (deletedGroup === null)
      throw new CustomError("There is no such group with given id", 404);

    await Group.updateMany(
      { parentGroup: id },
      { $unset: { parentGroup: 1 } }
    );

    context.res = {
      status: 200,
      body: deletedGroup,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
