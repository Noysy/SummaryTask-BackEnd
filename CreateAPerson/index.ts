import { AzureFunction, Context } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import errorHandler from "../Util/errorHandling";

const queueTrigger: AzureFunction = async function (
  context: Context,
  _myQueueItem: string
): Promise<void> {
  try {
    context.res = {
      status: 200,
      body: await MyGroup.findByIdAndUpdate(
        context.bindings.bothIds.group,
        { $push: { people: context.bindings.bothIds.person } },
        { new: true }
      ),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default queueTrigger;
