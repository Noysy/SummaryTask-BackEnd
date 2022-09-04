import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import { validateId } from "../Person/PersonInterface";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });
    await mongooseConnection();

    const deletedGroup = await MyGroup.findByIdAndDelete(id);

    if (deletedGroup === null)
      throw new CustomError("There is no such group with given id", 404);

    await MyGroup.updateMany(
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

export default httpTrigger;
