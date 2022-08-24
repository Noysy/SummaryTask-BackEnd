import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  idValidation,
  MyPerson,
  Person,
  personRequirements,
  updatePersonDetails,
} from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
import PersonRepository from "../Person/PersonRepository";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    idValidation({ id: id });

    const changes: Person = {
      name: req.body?.name,
      favoriteColor: req.body?.favoriteColor,
      favoriteAnimal: req.body?.favoriteAnimal,
      favoriteFood: req.body?.favoriteFood,
    };

    const validation = updatePersonDetails.validate(changes);
    if (validation.error) throw new CustomError(validation.error.message, 400);

    mongooseConnection();
    await MyPerson.findByIdAndUpdate(id, changes);

    context.res = {
      status: 200,
      body: await PersonRepository.getPerson(id),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
