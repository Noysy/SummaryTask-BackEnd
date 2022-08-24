import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { idValidation, MyPerson } from "../Person/PersonInterface";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    mongooseConnection();

    //  await MyPerson.find({});
    context.res = {
      body: await MyPerson.find({}),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
