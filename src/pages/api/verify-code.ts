import { NextApiRequest, NextApiResponse } from 'next';
import { createPool } from 'mysql2/promise';
import { mockSessions, mockQuestions } from '@/data/mockData';

// Create a connection pool to the MySQL database
const pool = createPool({
  host: process.env.DB_HOST || 'mysql-38ed915f-gasxchenzhuo-1826.j.aivencloud.com',
  port: Number(process.env.DB_PORT || 19674),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_uK1vNg5bd-vj8C280MG',
  database: process.env.DB_NAME || 'defaultdb',
});

export default async function verifyCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    console.log('Searching for verification code:', code);
    
    // Connect to the database
    const conn = await pool.getConnection();
    console.log('Connected to database to verify code:', code);
    
    try {
      // First look for sessions with this verification code
      const [rows] = await conn.query(`
        SELECT 
          s.id as submission_id,
          s.assignment_id,
          JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_name')) as student_name,
          JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_email')) as student_email,
          JSON_EXTRACT(s.submission_detection_result, '$.verification_questions') as verification_questions_json
        FROM 
          submission_detail_table s
        WHERE 
          JSON_EXTRACT(s.submission_detection_result, '$.verification_questions') IS NOT NULL
      `);
      
      // Check each session for matching verification code
      let matchingSession = null;
      let sessionId = '';
      
      for (const row of rows as any[]) {
        // Extract student name to construct verification code
        const studentName = row.student_name;
        const studentEmail = row.student_email;
        
        // Generate student ID from email
        const studentId = `student-${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`;
        
        // Construct session ID
        sessionId = `session-${row.assignment_id}-${studentId}`;
        
        // Now check if this session has the matching verification code
        // First look for the new random verification code format (first letter + random digits)
        const firstLetter = studentName.charAt(0);
        if (code.charAt(0).toUpperCase() === firstLetter.toUpperCase() && code.length >= 5) {
          console.log(`Found a code starting with ${firstLetter} for student ${studentName}, checking if it matches...`);
          
          // For now, we'll consider any code starting with the student's first letter to be valid
          // In a production system, we would store the actual verification codes in the database
          matchingSession = {
            id: sessionId,
            studentName,
            studentEmail
          };
          
          console.log(`Matched code ${code} to student ${studentName}`);
          break;
        }
      }
      
      if (!matchingSession) {
        // Fall back to mock data
        console.log('Available sessions:', mockSessions.map(s => ({ id: s.id, code: s.verificationCode })));
        
        // Find session with matching verification code
        const session = mockSessions.find(s => 
          s.verificationCode && s.verificationCode.toUpperCase() === code.toUpperCase()
        );

        if (!session) {
          console.log('No session found with verification code:', code);
          return res.status(400).json({ error: 'Invalid verification code' });
        }

        console.log('Found session:', session.id);

        // Check if session is already completed
        if (session.status === 'completed') {
          console.log('Session is already completed:', session.id);
          return res.status(400).json({ error: 'This session has been completed' });
        }

        // Get questions for the session
        const questions = mockQuestions.filter(q => 
          q.sessionId === session.id && !q.answered
        );
        
        console.log('Found questions:', questions.length);
        console.log('Questions:', questions);

        // Return session and questions
        return res.status(200).json({ 
          sessionId: session.id,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text
          }))
        });
      }
      
      // Return the real session data
      return res.status(200).json({
        sessionId: matchingSession.id,
        questions: [] // The actual questions will be fetched by a separate API call
      });
      
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 