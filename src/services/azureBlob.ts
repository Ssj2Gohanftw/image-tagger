import { BlobServiceClient } from "@azure/storage-blob";

/**
 * Uploads files to Azure Blob Storage (public container)
 * and returns a public URL that can be stored in MongoDB.
 */

// Read environment variables
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;

// Create Blob Service client
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Get reference to your container (e.g., "images")
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

/**
 * Upload file buffer to Azure Blob Storage
 * @param fileBuffer - File contents as a Buffer
 * @param fileName - File name in Azure
 * @param mimeType - MIME type (e.g., "image/png")
 * @returns Public blob URL
 */
export const uploadToAzure = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    // Return the public blob URL
    return blockBlobClient.url;
  } catch (error) {
    console.error("Azure Blob upload error:", error);
    throw new Error("Failed to upload to Azure Blob Storage");
  }
};
