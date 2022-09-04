import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import GroupManager from "../Group/GroupManager";
import GroupRepository from "../Group/GroupRepository";
import { validateId } from "../Person/PersonInterface";
import PersonManager from "../Person/PersonManager";
import CustomError from "../Util/customError";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  try {
    const id = context.bindingData.id;
    validateId({ id: id });
    const personId = context.bindingData.personId;
    validateId({ id: personId });

    await mongooseConnection();
    await GroupManager.getGroup(id);
    await PersonManager.getPerson(personId);

    if ((await GroupRepository.isPersonInGroup(id, personId)) !== null)
      throw new CustomError("This person is already in the group", 400);

    context.res = {
      status: 200,
      body: await GroupRepository.addPersonToGroup(id, personId),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
