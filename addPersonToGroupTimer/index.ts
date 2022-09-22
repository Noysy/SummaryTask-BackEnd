import { AzureFunction, Context } from "@azure/functions";
import { QueueServiceClient } from "@azure/storage-queue";
import Group from "../util/group.model";
import errorHandler from "../util/error.handling";

const timerTrigger: AzureFunction = async function (
  context: Context,
  _myTimer: any
): Promise<void> {
  try {
    const connectionString = process.env.AzureWebJobsStorage;

    const queueServiceClient =
      QueueServiceClient.fromConnectionString(connectionString);
    const queueClient = queueServiceClient.getQueueClient(
      "add-person-to-group-queue"
    );

    let queueItems = (await queueClient.getProperties())
      .approximateMessagesCount;

    while (queueItems > 0) {
      let currentMessages: number;
      if (queueItems > 32) {
        queueItems = queueItems - 32;
        currentMessages = 32;
      } else {
        currentMessages = queueItems;
      }
      const receivedMessages = await queueClient.receiveMessages({
        numberOfMessages: currentMessages,
      });

      receivedMessages.receivedMessageItems.forEach(async (message) => {
        const messageString = Buffer.from(message.messageText, "base64");
        const encryptedMessage = JSON.parse(messageString.toString());
        await Group.findByIdAndUpdate(
          encryptedMessage.group,
          { $push: { people: encryptedMessage.person } },
          { new: true }
        );
        await queueClient.deleteMessage(message.messageId, message.popReceipt);
      });
    }
  } catch (err) {
    errorHandler(context, err);
  }
};

export default timerTrigger;
