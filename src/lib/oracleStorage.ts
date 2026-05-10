import os from "oci-objectstorage";
import common from "oci-common";
import crypto from "crypto";

let client: os.ObjectStorageClient | null = null;

function getOracleStorageConfig() {
  const region = process.env.OCI_REGION;

  if (!region) {
    throw new Error("OCI_REGION is required for Oracle Object Storage operations");
  }

  if (!client) {
    const provider = new common.SimpleAuthenticationDetailsProvider(
      process.env.OCI_TENANCY_OCID || "",
      process.env.OCI_USER_OCID || "",
      process.env.OCI_FINGERPRINT || "",
      (process.env.OCI_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      null,
      common.Region.fromRegionId(region)
    );

    client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
  }

  return {
    client,
    namespaceName: process.env.OCI_NAMESPACE || "",
    bucketName: process.env.OCI_BUCKET_NAME || "",
  };
}

export async function uploadToOracleStorage(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
  const { client, namespaceName, bucketName } = getOracleStorageConfig();
  const fileExt = originalFilename.split(".").pop();
  const uniqueName = `${crypto.randomUUID()}.${fileExt}`;
  
  const putObjectRequest: os.requests.PutObjectRequest = {
    namespaceName: namespaceName,
    bucketName: bucketName,
    putObjectBody: fileBuffer,
    objectName: uniqueName,
    contentLength: fileBuffer.length,
    contentType: mimeType,
  };

  await client.putObject(putObjectRequest);
  return uniqueName;
}

export async function getFileStreamFromOracle(objectName: string) {
  const { client, namespaceName, bucketName } = getOracleStorageConfig();
  const getObjectRequest: os.requests.GetObjectRequest = {
    namespaceName: namespaceName,
    bucketName: bucketName,
    objectName: objectName,
  };
  const response = await client.getObject(getObjectRequest);
  return response.value as NodeJS.ReadableStream;
}

export async function deleteFromOracleStorage(objectName: string) {
  const { client, namespaceName, bucketName } = getOracleStorageConfig();
  const deleteObjectRequest: os.requests.DeleteObjectRequest = {
    namespaceName: namespaceName,
    bucketName: bucketName,
    objectName: objectName,
  };
  await client.deleteObject(deleteObjectRequest);
}
