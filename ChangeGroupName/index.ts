import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DBPerson, validateId } from "../person/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import Group from "../util/group.model";
import { nameLength } from "../util/joi";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    const name = req.body?.name;

    const validation = nameLength.validate({ name });
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();
    const group = await Group.findByIdAndUpdate(id, { name }, { new: true });
    if (!group) throw new notFoundError("group");

    context.res = {
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
