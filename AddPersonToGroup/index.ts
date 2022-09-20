import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { errors } from "../config";
import { Group } from "../Group/group.interface";
import { DBPerson, Person, validateId } from "../Person/person.interface";
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
    const { id, personId } = context.bindingData;
    validateId({ id: id });
    validateId({ id: personId });

    await mongooseConnection();
    if ((await Group.findOne({ _id: id })) === null) throw errors.noGroupErr;
    if ((await Person.findOne({ _id: personId })) === null)
      throw errors.noPersonErr;

    if ((await Group.findOne({ people: personId, _id: id })) !== null)
      throw new CustomError("This person is already in the group", 400);

    context.res = {
      status: 200,
      body: await Group.findByIdAndUpdate(
        id,
        { $push: { people: personId } },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
