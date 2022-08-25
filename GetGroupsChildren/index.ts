import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import GroupManager from "../Group/GroupManager";
import { validateId } from "../Person/PersonInterface";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });
    await mongooseConnection();

    await GroupManager.getGroup(id);

    context.res = {
      status: 200,
      body: await MyGroup.find({ parentGroup: id }).select({
        people: 1,
        name: 1,
      }),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
