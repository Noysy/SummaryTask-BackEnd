import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyPerson, Person } from "../Person/PersonInterface";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  user: Person
): Promise<void> {
  try {
    await mongooseConnection();

    context.res = {
      body: await MyPerson.find({}),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
