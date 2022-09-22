import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  validateId,
  IPerson,
  Person,
  updatePersonDetails,
  DBPerson,
} from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    const changes: IPerson = {
      name: req.body?.name,
      favoriteColor: req.body?.favoriteColor,
      favoriteAnimal: req.body?.favoriteAnimal,
      favoriteFood: req.body?.favoriteFood,
      role: req.body?.role,
    };

    const validation = updatePersonDetails.validate(changes);
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();

    context.res = {
      status: 200,
      body: await Person.findByIdAndUpdate(id, changes, { new: true }),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
