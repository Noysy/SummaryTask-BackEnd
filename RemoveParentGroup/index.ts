import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson } from "../util/person.interface";
import { adminPerm, authWrapper } from "../util/authorization";
import { notFoundError, validationError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import { validateId } from "../util/joi";

const RemoveParentGroup: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    await mongooseConnection();
    if (!(await Group.findById(id).exec())) throw new notFoundError("group");

    if (
      !(await Group.findOne({ _id: id, parentGroup: { $exists: true } }).exec())
    )
      throw new validationError("This group does not have a parent");

    context.res = {
      body: await Group.findByIdAndUpdate(
        id,
        { $unset: { parentGroup: 1 } },
        { new: true }
      ).exec(),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(RemoveParentGroup, adminPerm);
