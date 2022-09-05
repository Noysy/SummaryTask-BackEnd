import { AzureFunction, Context } from "@azure/functions";
import { QueueServiceClient } from "@azure/storage-queue";
import GroupRepository from "../Group/GroupRepository";
import errorHandler from "../Util/errorHandling";

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

    const queueItems = (await queueClient.getProperties())
      .approximateMessagesCount;

    const peekedMessages = await queueClient.peekMessages({
      numberOfMessages: queueItems,
    });

    peekedMessages.peekedMessageItems.forEach(async (message) => {
      const messageString = Buffer.from(message.messageText, "base64");
      const encryptedMessage = JSON.parse(messageString.toString());

      console.log(encryptedMessage.group, encryptedMessage.person);

      await GroupRepository.addPersonToGroup(
        encryptedMessage.group,
        encryptedMessage.person
      );
    });

    await queueClient.clearMessages();
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default timerTrigger;
