import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Group from "../util/group.model";
import { IPerson, validateId } from "../person/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const GetPersonsGroups: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);
    if (!id === id && user.role === "USER") throw new noPermissionError();

    await mongooseConnection();
    context.res = {
      body: await Group.find({ people: id }),
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(GetPersonsGroups, userPerm);
