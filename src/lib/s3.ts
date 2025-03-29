import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Uploads a file to S3 and returns a pre-signed URL
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
  // Validate environment variables
  if (!process.env.AWS_S3_BUCKET) {
    console.error('AWS_S3_BUCKET is not defined in environment variables');
    throw new Error('AWS_S3_BUCKET is not defined');
  }
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials are not properly configured');
    throw new Error('AWS credentials are not properly configured');
  }

  console.log('Starting S3 upload with params:', {
    bucket: process.env.AWS_S3_BUCKET,
    key,
    contentType,
    fileSize: file.length,
  });

  try {
    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Make the object public readable
      ACL: 'public-read',
    });

    console.log('Sending S3 upload command...');
    const uploadResult = await s3Client.send(uploadCommand);
    console.log('S3 upload successful:', uploadResult);

    // Generate a pre-signed URL that's valid for 7 days
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 604800 }); // 7 days
    console.log('Generated pre-signed URL:', url);
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific S3 error types
      if (error.name === 'NoSuchBucket') {
        throw new Error(`S3 bucket '${process.env.AWS_S3_BUCKET}' does not exist`);
      } 
      if (error.name === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket. Check your AWS credentials and bucket policies');
      }
    }
    
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 