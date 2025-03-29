import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadToS3 } from '../../lib/s3';
import prisma from '../../lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId, questionId, videoBlob } = req.body;
    
    // Validate inputs
    if (!sessionId || !questionId || !videoBlob) {
      console.error('Missing required fields:', { 
        hasSessionId: !!sessionId, 
        hasQuestionId: !!questionId, 
        hasVideoBlob: !!videoBlob?.length 
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Log request received
    console.log(`Received upload request for session ${sessionId}, question ${questionId}`);
    
    // Convert base64 to buffer
    const base64Data = videoBlob.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ message: 'Invalid video data format' });
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${sessionId}_${questionId}_${timestamp}.webm`;
    
    console.log(`Uploading video to S3: ${filename}`);
    
    // Upload to S3
    const videoUrl = await uploadToS3(buffer, filename, 'video/webm');
    console.log(`Upload successful, video URL: ${videoUrl}`);

    // First check if an answer already exists for this question
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        questionId: questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer with video URL
      console.log(`Updating existing answer (${existingAnswer.id}) with video URL`);
      await prisma.answer.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          videoUrl,
        },
      });
    } else {
      // Create a new answer with the video URL
      console.log(`Creating new answer for question ${questionId}`);
      await prisma.answer.create({
        data: {
          sessionId,
          questionId,
          videoUrl,
          submittedAt: new Date(),
        },
      });
    }

    return res.status(200).json({ 
      success: true, 
      videoUrl,
      message: 'Video uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Upload failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 