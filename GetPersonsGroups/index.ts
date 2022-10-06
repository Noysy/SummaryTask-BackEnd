import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import IPerson from "../util/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import { validateId } from "../util/joi";

const GetPersonsGroups: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    if (!(id === user.id) && user.role === "USER")
      throw new noPermissionError("an admin");

    await mongooseConnection();
    context.res = {
      body: await Group.find({ people: id }).exec(),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(GetPersonsGroups, userPerm);
