import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Person, IPerson } from "../Person/person.interface";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    await mongooseConnection();

    context.res = {
      body: await Person.find({}),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default httpTrigger;
