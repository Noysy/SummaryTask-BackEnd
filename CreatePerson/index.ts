import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import {
  DBPerson,
  IPerson,
  personRequirements,
} from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";

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
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();
    if (groupId)
      if ((await Group.findOne({ _id: groupId })) === null)
        throw new notFoundError("group");

    const { group, ...personToCreate } = person;
    const newPerson = await Person.create(personToCreate);

    context.res = {
      status: 200,
      body: newPerson,
    };

    if (groupId)
      context.bindings.addPersonToGroupQueue = {
        person: newPerson._id,
        group: groupId,
      };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
