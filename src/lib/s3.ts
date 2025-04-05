import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Create S3 client with proper configuration
 * With improved error handling and fallbacks
 */
function createS3Client() {
  // Validate environment variables
  const region = process.env.AWS_REGION || 'us-west-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!accessKeyId || !secretAccessKey) {
    console.warn('AWS credentials not properly configured');
  }
  
  try {
    return new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  } catch (error) {
    console.error('Failed to create S3 client:', error);
    throw new Error('Failed to initialize S3 client');
  }
}

// Initialize S3 client
const s3Client = createS3Client();

/**
 * Uploads a file to S3 and returns a pre-signed URL
 * Production-ready with better error handling and logging
 * 
 * @param file - The file buffer to upload
 * @param key - The S3 object key (filename)
 * @param contentType - The content type of the file
 * @returns A pre-signed URL to access the file
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const startTime = Date.now();
  
  // Validate input
  if (!file || file.length === 0) {
    throw new Error('No file data provided');
  }

  if (!key) {
    throw new Error('No key provided for S3 upload');
  }

  // Validate bucket
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not defined in environment variables');
  }
  
  console.log(`Starting S3 upload to bucket: ${bucket}, key: ${key}, size: ${file.length} bytes`);
  
  try {
    // Upload the file to S3 without ACL
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    };
    
    // Try up to 3 times with exponential backoff
    let attempt = 0;
    const maxAttempts = 3;
    
    while (attempt < maxAttempts) {
      try {
        console.log(`S3 upload attempt ${attempt + 1} of ${maxAttempts}`);
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Upload successful on attempt ${attempt + 1}`);
        break; // Success, exit the loop
      } catch (retryError) {
        attempt++;
        if (attempt >= maxAttempts) {
          // This was our last attempt, rethrow the error
          throw retryError;
        }
        // Wait before retrying (exponential backoff: 1s, 2s, 4s, etc.)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Upload failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Generate a pre-signed URL for reading the file (valid for 7 days)
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 * 7 });
    console.log('Generated pre-signed URL:', url);
    
    const duration = Date.now() - startTime;
    console.log(`S3 upload completed in ${duration}ms. URL generated: ${url.substring(0, 100)}...`);
    
    return url;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`S3 upload failed after ${duration}ms:`, error);
    
    if (error instanceof Error) {
      // Log specific error information for troubleshooting
      console.error({
        errorName: error.name,
        errorMessage: error.message,
        bucket,
        key,
        contentType,
        fileSize: file.length,
      });
      
      // Provide helpful error messages for common issues
      if (error.name === 'NoSuchBucket') {
        throw new Error(`S3 bucket '${bucket}' does not exist`);
      } 
      if (error.name === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket policies');
      }
      if (error.name === 'CredentialsProviderError') {
        throw new Error('Invalid AWS credentials. Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
      }
    }
    
    // Rethrow with helpful message
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 