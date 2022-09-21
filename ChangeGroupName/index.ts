import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Group, nameLength } from "../Group/group.interface";

import { DBPerson, validateId } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import { notFoundError, validationError } from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId({ id });

    const name = req.body?.name;

    const validation = nameLength.validate({ name });
    if (validation.error) throw new validationError(validation.error.message);

    await mongooseConnection();
    const group = await Group.findByIdAndUpdate(id, { name }, { new: true });
    if (group === null)
    throw new notFoundError("group");

    context.res = {
      status: 200,
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
