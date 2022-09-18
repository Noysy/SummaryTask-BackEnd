import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import GroupManager from "../Group/GroupManager";
import GroupRepository from "../Group/GroupRepository";
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
    await GroupManager.getGroup(id);

    if ((await GroupRepository.isPersonInGroup(id, personId)) === null)
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
