import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import IPerson from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import Group from "../util/group.model";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";
import { validateId } from "../util/joi";

const DeletePerson: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    await mongooseConnection();
    const person = await Person.findByIdAndDelete(id).exec();
    if (!person) throw new notFoundError("person");

    await Group.updateMany({ people: id }, { $pull: { people: id } }).exec();

    context.res = {
      body: person,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(DeletePerson, adminPerm);
