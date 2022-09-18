import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup, nameLength } from "../Group/GroupInterface";
import GroupRepository from "../Group/GroupRepository";
import { DBPerson, validateId } from "../Person/PersonInterface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });

    const newName = req.body?.name;

    const validation = nameLength.validate({ name: newName });
    if (validation.error) throw new CustomError(validation.error.message, 400);

    await mongooseConnection();
    const group = await MyGroup.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );
    if (group === null)
      throw new CustomError("There is no such group with given id", 404);

    context.res = {
      status: 200,
      body: group
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
