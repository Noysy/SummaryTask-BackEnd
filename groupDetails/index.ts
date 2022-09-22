import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import Group from "../util/group.model";
import { IPerson, validateId } from "../person/person.interface";
import { authWrapper, userPerm } from "../util/authorization";
import { noPermissionError } from "../util/custom.error";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    validateId(id);

    await mongooseConnection();
    const group = await Group.findById(id).populate("people");

    if (user.role === "USER") {
      const userGroups = await Group.find({ people: user.id });
      if (
        !userGroups.some((userGroup) => `${userGroup._id}` === `${group._id}`)
      )
        throw new noPermissionError();
    }

    context.res = {
      body: group,
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
