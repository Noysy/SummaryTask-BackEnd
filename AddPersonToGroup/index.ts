import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson } from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";
import { validateId } from "../util/joi";

const AddPersonToGroup: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id, personId } = context.bindingData;
    validateId(id);
    validateId(personId);

    await mongooseConnection();
    if (!(await Group.findById(id).exec())) throw new notFoundError("group");
    if (!(await Person.findById(personId).exec())) throw new notFoundError("person");

    if ((await Group.findOne({ people: personId, _id: id }).exec()) !== null)
      throw new validationError("This person is already in the group");

    context.res = {
      body: await Group.findByIdAndUpdate(
        id,
        { $push: { people: personId } },
        { new: true }
      ).exec(),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(AddPersonToGroup, adminPerm);
