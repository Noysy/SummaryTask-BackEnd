import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { DBPerson, MyPerson } from "../Person/person.interface";
import errorHandler from "../Util/error.handling";
import mongooseConnection from "../Util/mongoose.connection";
import multipart from "parse-multipart";
import CustomError from "../Util/custom.error";
import { authWrapper, userPerm } from "../Util/authorization";
import { errors } from "../config";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  _user: DBPerson
): Promise<void> {
  try {
    const id = context.bindingData.id;
    await mongooseConnection();
    if ((await MyPerson.findOne({ _id: id })) === null)
      throw errors.noPersonErr;

    const bodyBuffer = Buffer.from(req.body);
    const boundary = multipart.getBoundary(req.headers["content-type"]);
    const data = multipart.Parse(bodyBuffer, boundary)[0];
    if (
      await MyPerson.findOne({
        _id: id,
        files: { $elemMatch: { name: `${id}-${data.filename}` } },
      })
    )
      throw new CustomError("You can't upload the same image! smh", 400);

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
    const storageAccount = "rgnoyhafifa802e";

    const SASToken = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("racwd"),
        expiresOn: new Date(new Date().valueOf() + 86400),
        protocol: SASProtocol.HttpsAndHttp,
      },
      new StorageSharedKeyCredential(
        storageAccount,
        "hBPdC5g+vpMCWxM+fvB9NGcqZjAdZ/HKmRQhOXD5PY3IqJlk6ZGzCdorihZNFaVeY9n9c9kzrCUW+AStomyDqw=="
      )
    ).toString();
    const SASUrl = `https://${storageAccount}.blob.core.windows.net/${containerName}/${blobName}?${SASToken}`;
    await MyPerson.findByIdAndUpdate(id, {
      $push: { files: { name: `${id}-${data.filename}`, url: SASUrl } },
    });

    context.res = {
      status: 200,
      body: { name: data.filename, url: SASUrl },
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
