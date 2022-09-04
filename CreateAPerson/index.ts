import { AzureFunction, Context } from "@azure/functions";

const queueTrigger: AzureFunction = async function (
  context: Context,
  _myQueueItem: string
): Promise<void> {
  console.log("all", context.bindings.bothIds);
  const personId = context.bindings.bothIds.person;
  const groupId = context.bindings.bothIds.group;
};

export default queueTrigger;
