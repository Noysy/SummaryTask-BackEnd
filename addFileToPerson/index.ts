import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import IPerson from "../util/person.interface";
import errorHandler from "../util/error.handling";
import mongooseConnection from "../util/mongoose.connection";
import multipart from "parse-multipart";
import {
  CustomError,
  notFoundError,
  validationError,
} from "../util/custom.error";
import { authWrapper, userPerm } from "../util/authorization";
import Person from "../util/person.model";
import configFile from "../config";

const AddFileToPerson: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: IPerson
): Promise<void> {
  try {
    const { id } = context.bindingData;
    await mongooseConnection();
    if (!(await Person.findById(id).exec())) throw new notFoundError("person");

    const bodyBuffer = Buffer.from(req.body);
    const boundary = multipart.getBoundary(req.headers["content-type"]);
    const data = multipart.Parse(bodyBuffer, boundary)[0];
    if (
      await Person.findById({
        id,
        files: { $elemMatch: { name: `${id}-${data.filename}` } },
      }).exec()
    )
      throw new validationError("You can't upload the same image! smh");

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );

    const containerName = "people-documents";
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(
      `${id}-${data.filename}`
    );

    const response = await blockBlobClient.uploadData(data.data, {
      blobHTTPHeaders: {
        blobContentType: data.type,
      },
    });
    if (response._response.status !== 201) {
      throw new CustomError(
        `Error uploading document ${blockBlobClient.name} to container ${blockBlobClient.containerName}`,
        500
      );
    }

    const blobName = `${id}-${data.filename}`;
    const storageAccount = configFile.storageAccount;

    const SASToken = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("racwd"),
        expiresOn: new Date(new Date().valueOf() + 86400),
        protocol: SASProtocol.HttpsAndHttp,
      },
      new StorageSharedKeyCredential(storageAccount, configFile.accountKey)
    ).toString();
    const SASUrl = `https://${storageAccount}.blob.core.windows.net/${containerName}/${blobName}?${SASToken}`;
    await Person.findByIdAndUpdate(id, {
      $push: { files: { name: `${id}-${data.filename}`, url: SASUrl } },
    }).exec();

    context.res = {
      body: { name: data.filename, url: SASUrl },
    };
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(AddFileToPerson, userPerm);
