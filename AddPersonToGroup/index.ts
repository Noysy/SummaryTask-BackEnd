import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group } from "../group/group.interface";
import { DBPerson, Person, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id, personId } = context.bindingData;
    validateId(id);
    validateId({ id: personId });

    await mongooseConnection();
    if ((await Group.findOne({ _id: id })) === null) throw new notFoundError("group");
    if ((await Person.findOne({ _id: personId })) === null)
    throw new notFoundError("person");

    if ((await Group.findOne({ people: personId, _id: id })) !== null)
      throw new validationError("This person is already in the group");

    context.res = {
      status: 200,
      body: await Group.findByIdAndUpdate(
        id,
        { $push: { people: personId } },
        { new: true }
      ),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
