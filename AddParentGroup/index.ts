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
    const parentId = context.bindingData.parentId;
    validateId({ id: parentId });

    await mongooseConnection();
    await GroupManager.getGroup(id);

    if (id === parentId)
      throw new CustomError("A group can't be its own parent.", 400);

    await GroupManager.getGroup(parentId);

    if (await GroupRepository.doesGroupHaveParent(id))
      throw new CustomError("The group already has a parent", 400);

    const checkPrecedingParent = async (id: string, parentGroup: string) => {
      if (id === parentGroup) return null;

      if (await GroupRepository.doesGroupHaveParent(parentGroup)) {
        const parent = await MyGroup.findById(parentGroup, {
          parentGroup: 1,
          _id: 0,
        });
        console.log(parent);

        await checkPrecedingParent(id, String(parent?.parentGroup));
      } else return false;
    };

    if ((await checkPrecedingParent(id, parentId)) === undefined)
      throw new CustomError("A group can't be it's own preceding parent", 400);

    context.res = {
      status: 200,
      body: await MyGroup.findByIdAndUpdate(
        id,
        { parentGroup: parentId },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;
