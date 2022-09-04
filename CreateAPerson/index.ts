import { AzureFunction, Context } from "@azure/functions";
import GroupRepository from "../Group/GroupRepository";
import errorHandler from "../Util/errorHandling";

const queueTrigger: AzureFunction = async function (
  context: Context,
  _myQueueItem: string
): Promise<void> {
  try {
    context.res = {
      status: 200,
      body: await GroupRepository.addPersonToGroup(context.bindings.bothIds.group, context.bindings.bothIds.person),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default queueTrigger;
