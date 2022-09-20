import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { Group } from "../Group/group.interface";
import { DBPerson, validateId } from "../Person/person.interface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/custom.error";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId({ id: id });

    await mongooseConnection();
    if ((await Group.findOne({ _id: id })) === null) throw errors.noGroupErr;

    if (
      (await Group.findOne({ _id: id, parentGroup: { $exists: true } })) ===
      null
    )
      throw new CustomError("This group does not have a parent", 404);

    context.res = {
      status: 200,
      body: await Group.findByIdAndUpdate(
        id,
        { $unset: { parentGroup: 1 } },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
