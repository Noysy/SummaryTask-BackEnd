import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import GroupManager from "../Group/GroupManager";
import GroupRepository from "../Group/GroupRepository";
import { validateId } from "../Person/PersonInterface";
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

    await mongooseConnection();
    await GroupManager.getGroup(id);

    if ((await GroupRepository.doesGroupHaveParent(id)) === null)
      throw new CustomError("This group does not have a parent", 404);

    context.res = {
      status: 200,
      body: await MyGroup.findByIdAndUpdate(
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

export default httpTrigger;
