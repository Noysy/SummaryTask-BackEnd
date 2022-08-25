import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateId } from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
import PersonRepository from "../Person/PersonRepository";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id });

    mongooseConnection();
    const person = await PersonManager.getPerson(id);
    context.res = {
      body: person,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
