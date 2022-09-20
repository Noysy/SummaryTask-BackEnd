import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyPerson, Person } from "../Person/person.interface";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: Person
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
