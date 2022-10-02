import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson } from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";
import { personRequirements } from "../util/joi";

const CreatePerson: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { group: groupId } = req.body;

    const validation = personRequirements.validate(req.body.person);
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();
    if (groupId)
      if (!(await Group.findById({ _id: groupId }).exec()))
        throw new notFoundError("group");

    const { group, ...personToCreate } = req.body.person;

    const newPerson = await Person.create(personToCreate);

    context.res = {
      status: 201,
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

export default authWrapper(CreatePerson, adminPerm);
