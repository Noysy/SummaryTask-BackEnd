import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { DBPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import {
  notFoundError,
  validationError,
} from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    await mongooseConnection();
    if ((await Group.findOne({ _id: id })) === null)
      throw new notFoundError("group");

    if (
      (await Group.findOne({ _id: id, parentGroup: { $exists: true } })) ===
      null
    )
      throw new validationError("This group does not have a parent");

    context.res = {
      status: 200,
      body: await Group.findByIdAndUpdate(
        id,
        { $unset: { parentGroup: 1 } },
        { new: true }
      ),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
