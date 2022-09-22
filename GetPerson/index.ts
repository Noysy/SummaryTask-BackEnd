import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DBPerson, Person, validateId } from "../person/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError, notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    if (!id === id && user.role === "USER") throw new noPermissionError();

    await mongooseConnection();
    const person = await Person.findOne({ _id: id });
    if (person === null) throw new notFoundError("person");

    context.res = {
      body: person,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
