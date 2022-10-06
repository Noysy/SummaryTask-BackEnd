import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson } from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import { validateId } from "../util/joi";

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

    const group = await Group.findById(id).exec();

    if (!group) throw new notFoundError("group");

    if (!group.people.includes(personId)) throw new notFoundError("person");

    await group.updateOne({ $pull: { people: personId } }, { new: true }).exec();
    await group.save();

    context.res = {
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(RemovePersonFromGroup, adminPerm);
