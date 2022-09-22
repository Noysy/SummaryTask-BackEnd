import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const RemovePersonFromGroup: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id, personId } = context.bindingData;
    validateId(id);
    validateId(personId);

    await mongooseConnection();

    if ((await Group.findOne({ _id: id })) === null)
      throw new notFoundError("group");

    if ((await Group.findOne({ people: personId, _id: id })) === null)
      throw new notFoundError("person");

    context.res = {
      body: await Group.findByIdAndUpdate(
        id,
        { $pull: { people: personId } },
        { new: true }
      ),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(RemovePersonFromGroup, adminPerm);
