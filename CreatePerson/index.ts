import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import GroupManager from "../Group/GroupManager";
import {
  MyPerson,
  Person,
  personRequirements,
} from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const person: Person = {
      name: req.body?.name,
      favoriteColor: req.body?.favoriteColor,
      favoriteAnimal: req.body?.favoriteAnimal,
      favoriteFood: req.body?.favoriteFood,
      group: req.body?.group,
    };

    const groupId = person.group;

    const validation = personRequirements.validate(person);
    if (validation.error) throw new CustomError(validation.error.message, 400);

    await mongooseConnection();
    if (groupId) await GroupManager.getGroup(groupId);

    const newPerson = await MyPerson.create({
      name: person.name,
      favoriteColor: person.favoriteColor,
      favoriteAnimal: person.favoriteAnimal,
      favoriteFood: person.favoriteFood,
    });

    context.res = {
      status: 200,
      body: newPerson,
    };

    if (groupId)
      context.bindings.bothIds = { person: newPerson._id, group: groupId };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
