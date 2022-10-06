import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import IPerson from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";
import { updatePersonDetails, validateId } from "../util/joi";

const EditPerson: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    
    const validation = updatePersonDetails.validate(req.body);
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();

    const person = await Person.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!person) throw new notFoundError("person");

    context.res = {
      body: person,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(EditPerson, adminPerm);
