import { AzureFunction, Context } from "@azure/functions";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const blobTrigger: AzureFunction = async function (
  context: Context,
  _myBlob: any
): Promise<void> {
  const containerName = "people-documents";
  const blobName = context.bindingData.name;
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

  console.log(SASUrl);
};

export default blobTrigger;
