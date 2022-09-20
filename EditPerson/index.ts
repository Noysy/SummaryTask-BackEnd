import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  validateId,
  IPerson,
  Person,
  updatePersonDetails,
  DBPerson,
} from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id });

    const changes: IPerson = {
      name: req.body?.name,
      favoriteColor: req.body?.favoriteColor,
      favoriteAnimal: req.body?.favoriteAnimal,
      favoriteFood: req.body?.favoriteFood,
      role: req.body?.role
    };

    const validation = updatePersonDetails.validate(changes);
    if (validation.error) throw new CustomError(validation.error.message, 400);

    await mongooseConnection();

    context.res = {
      status: 200,
      body: await Person.findByIdAndUpdate(id, changes, {new: true})
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
