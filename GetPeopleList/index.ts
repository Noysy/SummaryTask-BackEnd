import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";

const GetPeopleList: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
): Promise<void> {
  try {
    await mongooseConnection();

    context.res = {
      body: await Person.find().exec(),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default GetPeopleList;
