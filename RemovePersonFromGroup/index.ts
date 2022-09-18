import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { MyGroup } from "../Group/GroupInterface";
import { DBPerson, validateId } from "../Person/PersonInterface";
import { adminPerm, authWrapper } from "../Util/authorization";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });
    const personId = context.bindingData.personId;
    validateId({ id: personId });

    await mongooseConnection();

    if ((await MyGroup.findOne({ _id: id })) === null) throw errors.noGroupErr;

    if ((await MyGroup.findOne({ people: personId, _id: id })) === null)
      throw new CustomError("There is no such person in the group", 404);

    context.res = {
      status: 200,
      body: await MyGroup.findByIdAndUpdate(
        id,
        { $pull: { people: personId } },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
