import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../Group/group.interface";
import { validateId, Person, DBPerson } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import { notFoundError } from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId({ id });

    await mongooseConnection();
    const person = await Person.findByIdAndDelete(id);
    if (person === null) throw new notFoundError("person");

    await Group.updateMany({ people: id }, { $pull: { people: id } });

    context.res = {
      body: person,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
