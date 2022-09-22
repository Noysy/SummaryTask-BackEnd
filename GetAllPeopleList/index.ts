import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Person, IPerson } from "../person/person.interface";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

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
