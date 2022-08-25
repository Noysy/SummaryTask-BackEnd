import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateId } from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id });

    await mongooseConnection();
    context.res = {
      body: await PersonManager.getPerson(id),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
