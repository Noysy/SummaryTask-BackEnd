import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/group.interface";
import { validateId, MyPerson, DBPerson } from "../Person/person.interface";
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
    validateId({ id });

    await mongooseConnection();
    const person = await MyPerson.findByIdAndDelete(id);
    if (person === null)
      throw new CustomError("There is no such person with given id", 404);

    (await MyGroup.find({ people: id }, { _id: 1 })).forEach(
      async (groupId) => {
        await MyGroup.findByIdAndUpdate(groupId, { $pull: { people: id } });
      }
    );

    context.res = {
      body: person,
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, adminPerm);
