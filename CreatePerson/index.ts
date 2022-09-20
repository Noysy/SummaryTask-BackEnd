import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { Group } from "../Group/group.interface";
import {
  DBPerson,
  IPerson,
  Person,
  personRequirements,
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
    const person: IPerson = {
      name: req.body?.name,
      favoriteColor: req.body?.favoriteColor,
      favoriteAnimal: req.body?.favoriteAnimal,
      favoriteFood: req.body?.favoriteFood,
      role: req.body?.role,
      group: req.body?.group,
    };

    const groupId = person.group;

    const validation = personRequirements.validate(person);
    if (validation.error) throw new CustomError(validation.error.message, 400);

    await mongooseConnection();
    if (groupId)
      if ((await Group.findOne({ _id: groupId })) === null)
        throw errors.noGroupErr;

    const newPerson = await Person.create({
      name: person.name,
      favoriteColor: person.favoriteColor,
      favoriteAnimal: person.favoriteAnimal,
      favoriteFood: person.favoriteFood,
      role: person.role,
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

export default authWrapper(httpTrigger, adminPerm);
