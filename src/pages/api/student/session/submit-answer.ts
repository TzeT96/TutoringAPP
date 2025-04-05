import { NextApiRequest, NextApiResponse } from 'next';
import { uploadToS3 } from '@/lib/s3';
import { getConnection } from '@/lib/db';

/**
 * Extract submission ID from session ID
 * @param sessionId Format: session-{submissionId}-student-{studentId}
 * @returns The extracted submission ID or null if not valid
 */
function extractSubmissionId(sessionId: string): string | null {
  // Try the standard format first: session-{submissionId}-student-{studentId}
  const standardMatch = sessionId.match(/^session-(\d+)-student-/);
  if (standardMatch) {
    return standardMatch[1];
  }
  
  // If it's just the verification code (like R1285), try to extract from database
  // This is for backward compatibility with older client versions
  if (/^[A-Z]\d{4,5}$/.test(sessionId)) {
    console.log(`Received a verification code instead of session ID: ${sessionId}`);
    return null; // Will be handled specially later
  }
  
  return null;
}

/**
 * Process video data for S3 upload
 * @param videoBlob Base64 encoded video data or data URL
 * @returns Buffer ready for S3 upload
 */
function processVideoData(videoBlob: string): Buffer {
  if (videoBlob.startsWith('data:')) {
    // Extract base64 data from data URL
    const base64Data = videoBlob.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }
  // Regular base64 string
  return Buffer.from(videoBlob, 'base64');
}

/**
 * Safely parse JSON tutoring answer from database
 * @param rawData The raw data from the database
 * @returns Properly parsed tutoring_answer object
 */
function parseTutoringAnswer(rawData: any): any {
  // If null or undefined, return empty object
  if (!rawData) {
    return { answers: [] };
  }
  
  // If already an object, use it directly
  if (typeof rawData === 'object' && !Buffer.isBuffer(rawData)) {
    return {
      ...rawData,
      answers: Array.isArray(rawData.answers) ? rawData.answers : []
    };
  }
  
  // If it's a string, try to parse it
  if (typeof rawData === 'string') {
    try {
      const parsed = JSON.parse(rawData);
      return {
        ...parsed,
        answers: Array.isArray(parsed.answers) ? parsed.answers : []
      };
    } catch (e) {
      console.error('Failed to parse tutoring_answer JSON string:', e);
      return { answers: [] };
    }
  }
  
  // Default fallback
  return { answers: [] };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔵 Submit answer API called:', new Date().toISOString());
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { sessionId, questionId, textAnswer, videoBlob } = req.body;
  
  console.log(`🔵 Processing submission:
    Session ID: ${sessionId}
    Question ID: ${questionId}
    Has text: ${Boolean(textAnswer)}
    Has video: ${Boolean(videoBlob)}
  `);
  
  if (!sessionId || !questionId) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'Session ID and Question ID are required' });
  }

  if (!textAnswer && !videoBlob) {
    console.log('❌ No answer content provided');
    return res.status(400).json({ error: 'Either text answer or video recording is required' });
  }

  try {
    // Extract submission ID from session ID
    let submissionId = extractSubmissionId(sessionId);
    
    // If we couldn't extract the submission ID and it looks like a verification code,
    // try to look it up in the database
    if (!submissionId && /^[A-Z]\d{4,5}$/.test(sessionId)) {
      // Connect to the database to look up the verification code
      const conn = await getConnection();
      
      try {
        // Query to find the submission ID for this verification code
        // We'll use the first letter of the verification code to match the student's name
        const firstLetter = sessionId.charAt(0);
        
        const [rows] = await conn.query(`
          SELECT 
            s.id as submission_id,
            JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_name')) as student_name
          FROM 
            submission_detail_table s
          WHERE 
            JSON_EXTRACT(s.submission_detection_result, '$.verification_questions') IS NOT NULL
            AND LEFT(JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_name')), 1) = ?
        `, [firstLetter]);
        
        // Find the matching row
        for (const row of rows as any[]) {
          if (row.student_name && row.student_name.charAt(0).toUpperCase() === firstLetter.toUpperCase()) {
            submissionId = row.submission_id.toString();
            console.log(`✅ Found submission ID ${submissionId} for verification code ${sessionId}`);
            break;
          }
        }
        
        if (!submissionId) {
          console.log(`❌ Could not find submission for verification code: ${sessionId}`);
          return res.status(400).json({ error: 'Invalid session ID format or verification code' });
        }
      } finally {
        conn.release();
      }
    }
    
    if (!submissionId) {
      console.log(`❌ Invalid session ID format: ${sessionId}`);
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    console.log(`🔵 Extracted submission ID: ${submissionId}`);
    
    // Upload video to S3 if present
    let videoUrl = null;
    if (videoBlob) {
      try {
        console.log('🔵 Processing video for upload');
        const key = `verification-videos/${sessionId}/${questionId}-${Date.now()}.webm`;
        
        // Convert base64 to Buffer for S3 upload with chunking for large videos
        let buffer: Buffer;
        
        // Handle data URL format
        if (typeof videoBlob === 'string') {
          try {
            if (videoBlob.startsWith('data:')) {
              // Extract the base64 data part from the data URL
              const base64Data = videoBlob.split(',')[1];
              if (!base64Data) {
                throw new Error('Invalid data URL format');
              }
              buffer = Buffer.from(base64Data, 'base64');
            } else {
              buffer = Buffer.from(videoBlob, 'base64');
            }
            
            // Check buffer size and validity
            if (buffer.length === 0) {
              throw new Error('Empty video buffer');
            }
            
            console.log(`🔵 Converted video to buffer, size: ${buffer.length} bytes`);
            
            // Set a timeout for the S3 upload
            const uploadPromise = uploadToS3(buffer, key, 'video/webm');
            const timeoutPromise = new Promise<string>((_, reject) => {
              setTimeout(() => reject(new Error('S3 upload timed out')), 20000); // 20 second timeout
            });
            
            // Race the upload against a timeout
            videoUrl = await Promise.race([uploadPromise, timeoutPromise]);
            console.log('✅ Video uploaded successfully');
          } catch (conversionError: any) {
            console.error('❌ Video conversion error:', conversionError);
            throw new Error(`Video conversion failed: ${conversionError.message || 'Unknown error'}`);
          }
        } else {
          console.log('❌ Video data is not a string');
          throw new Error('Video data must be a base64 string');
        }
      } catch (error) {
        console.error('❌ Error uploading video:', error);
        
        // Continue with text answer even if video upload fails
        if (textAnswer) {
          console.log('⚠️ Video upload failed but continuing with text answer');
        } else {
          return res.status(500).json({ 
            error: 'Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error') 
          });
        }
      }
    }
    
    // Get database connection
    console.log('🔵 Connecting to database');
    const conn = await getConnection();
    
    try {
      // Check if submission exists
      const [rows] = await conn.query(
        'SELECT tutoring_answer FROM submission_detail_table WHERE id = ?',
        [submissionId]
      );
      
      if (!rows || (rows as any[]).length === 0) {
        console.log(`❌ Submission not found with ID: ${submissionId}`);
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      // Parse existing tutoring_answer data safely
      console.log('🔵 Processing existing tutoring_answer data');
      let tutoringAnswer: any = { answers: [] };
      const existingData = (rows as any)[0]?.tutoring_answer;
      
      if (existingData) {
        if (typeof existingData === 'string') {
          try {
            tutoringAnswer = JSON.parse(existingData);
          } catch (e) {
            console.error('❌ Error parsing tutoring_answer string:', e);
          }
        } else if (typeof existingData === 'object') {
          tutoringAnswer = existingData;
        }
      }
      
      // Ensure answers array exists
      if (!tutoringAnswer.answers) {
        tutoringAnswer.answers = [];
      }
      
      // Create new answer object
      const newAnswer = {
        question_id: questionId,
        text_answer: textAnswer || null,
        video_url: videoUrl,
        submitted_at: new Date().toISOString()
      };
      
      console.log('🔵 Adding new answer:', JSON.stringify(newAnswer));
      
      // Find existing answer for this question or add new one
      const existingAnswerIndex = tutoringAnswer.answers.findIndex(
        (a: any) => a.question_id === questionId
      );
      
      if (existingAnswerIndex >= 0) {
        tutoringAnswer.answers[existingAnswerIndex] = newAnswer;
      } else {
        tutoringAnswer.answers.push(newAnswer);
      }
      
      // Update database with new answer
      await conn.query(
        'UPDATE submission_detail_table SET tutoring_answer = ? WHERE id = ?',
        [JSON.stringify(tutoringAnswer), submissionId]
      );
      
      console.log('✅ Answer submitted successfully');
      return res.status(200).json({ success: true, answer: newAnswer });
    } finally {
      // Always release connection
      conn.release();
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Failed to submit answer: ' + (error instanceof Error ? error.message : 'Unknown error') 
    });
  }
}

// Extend the API response timeout for processing large videos
// This is a Next.js-specific configuration to prevent API timeout
// during video processing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increased from default 1mb
    },
    responseLimit: false, // No response size limit
  },
}; 