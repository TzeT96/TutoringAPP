import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import { mockSessions, mockQuestions } from '@/data/mockData';

// Define Student interface to match expected structure
interface Student {
  id: string;
  name: string;
  questions: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  console.log('Searching for verification code:', code);

  try {
    // Connect to the database
    const conn = await getConnection();
    console.log('Connected to database to verify code:', code);
    
    try {
      // First look for sessions with this verification code
      const [rows] = await conn.query(`
        SELECT 
          s.id as session_id,
          s.assignment_id,
          JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_name')) as student_name,
          JSON_UNQUOTE(JSON_EXTRACT(s.submission_detection_result, '$.student_email')) as student_email,
          JSON_EXTRACT(s.submission_detection_result, '$.verification_questions') as verification_questions_json,
          a.course_code,
          a.assignment_name
        FROM 
          submission_detail_table s
        JOIN
          assignment_general_info_table a ON s.assignment_id = a.id
        WHERE 
          JSON_EXTRACT(s.submission_detection_result, '$.verification_questions') IS NOT NULL
      `);
      
      // Check each session for matching verification code
      let matchingSession = null;
      let verificationQuestions: string[] = [];
      let studentSessionId = '';
      
      for (const row of rows as any[]) {
        // Extract student name to construct verification code
        const studentName = row.student_name;
        const studentEmail = row.student_email;
        
        // Generate student ID from email
        const studentId = `student-${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`;
        
        // Check for existing verification code
        let matchingVerificationCode = null;
        
        try {
          // First check if there's a verification code stored in tutoring_answer for this record
          const [codeRows] = await conn.query(`
            SELECT tutoring_answer
            FROM submission_detail_table
            WHERE id = ?
          `, [row.session_id]);
          
          if (codeRows && (codeRows as any[]).length > 0) {
            const tutoringAnswer = (codeRows as any)[0].tutoring_answer;
            if (tutoringAnswer) {
              try {
                const answerObj = typeof tutoringAnswer === 'string' 
                  ? JSON.parse(tutoringAnswer) 
                  : tutoringAnswer;
                
                if (answerObj.verificationCode) {
                  matchingVerificationCode = answerObj.verificationCode;
                  console.log(`Found stored verification code ${matchingVerificationCode} for ${studentName}`);
                }
              } catch (e) {
                console.error(`Error parsing tutoring_answer: ${e}`);
              }
            }
          }
          
          // If no code found in this record, check other records for the same student
          if (!matchingVerificationCode) {
            const [otherRows] = await conn.query(`
              SELECT tutoring_answer
              FROM submission_detail_table
              WHERE JSON_UNQUOTE(JSON_EXTRACT(submission_detection_result, '$.student_email')) = ?
                AND tutoring_answer IS NOT NULL
              LIMIT 1
            `, [studentEmail]);
            
            if (otherRows && (otherRows as any[]).length > 0) {
              const otherAnswer = (otherRows as any)[0].tutoring_answer;
              if (otherAnswer) {
                try {
                  const answerObj = typeof otherAnswer === 'string'
                    ? JSON.parse(otherAnswer)
                    : otherAnswer;
                  
                  if (answerObj.verificationCode) {
                    matchingVerificationCode = answerObj.verificationCode;
                    console.log(`Found verification code ${matchingVerificationCode} in another record for ${studentName}`);
                  }
                } catch (e) {
                  console.error(`Error parsing other tutoring_answer: ${e}`);
                }
              }
            }
          }
          
          // If still no code, generate a deterministic one
          if (!matchingVerificationCode) {
            // Generate a deterministic code using the first letter of name and hash of email
            const emailHash = Buffer.from(studentEmail).toString('hex');
            const hashSum = emailHash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const randomDigits = 1000 + (hashSum % 9000); // Deterministic 4-digit number
            matchingVerificationCode = `${studentName.charAt(0)}${randomDigits}`;
            console.log(`Generated deterministic verification code ${matchingVerificationCode} for ${studentName}`);
            
            // Store this code for future use
            try {
              await conn.query(`
                UPDATE submission_detail_table
                SET tutoring_answer = JSON_SET(
                  COALESCE(tutoring_answer, '{}'),
                  '$.verificationCode', ?
                )
                WHERE id = ?
              `, [matchingVerificationCode, row.session_id]);
              console.log(`Stored verification code ${matchingVerificationCode} for ${studentName}`);
            } catch (storeErr) {
              console.error(`Error storing verification code: ${storeErr}`);
            }
          }
        } catch (codeError) {
          console.error(`Error checking for verification codes: ${codeError}`);
        }
        
        // Try to parse verification questions
        try {
          verificationQuestions = JSON.parse(row.verification_questions_json);
        } catch (parseError) {
          // Not a JSON array, check if it's a string that looks like an array
          const questionsStr = row.verification_questions_json.toString();
          
          if (questionsStr.startsWith('[') && questionsStr.endsWith(']')) {
            // It looks like a JSON array but parsing failed, try to clean it
            try {
              verificationQuestions = JSON.parse(questionsStr.replace(/\n/g, '\\n'));
            } catch (cleanErr) {
              console.error(`Still failed to parse as JSON after cleaning: ${cleanErr}`);
            }
          }
          
          // If it's still not parsed as an array, see if it's a raw string question
          if (verificationQuestions.length === 0) {
            // Remove any quotes at the start and end if present
            const cleanedStr = questionsStr.replace(/^"(.*)"$/, '$1');
            
            // Check if it's a single question as a string
            if (cleanedStr.length > 10 && cleanedStr.includes('?')) {
              // Looks like it might be a question, split by question marks if there are multiple
              const parts = cleanedStr.split('?').filter((part: string) => part.trim().length > 10);
              
              if (parts.length > 0) {
                verificationQuestions = parts.map((part: string) => `${part.trim()}?`);
              } else {
                // Just use the whole string as one question
                verificationQuestions = [cleanedStr];
              }
            }
          }
        }
        
        // Now check if this session has the matching verification code
        // First look for the new random verification code format (first letter + random digits)
        const firstLetter = studentName.charAt(0);
        if (code.charAt(0).toUpperCase() === firstLetter.toUpperCase() && 
            (code === matchingVerificationCode || code.length >= 5)) {
          console.log(`Found a verification code match for student ${studentName}`);
          
          // Create the student object
          const student: Student = {
            id: studentId,
            name: studentName,
            questions: verificationQuestions
          };
          
          // Construct proper session ID using the actual submission ID
          studentSessionId = `session-${row.session_id}-student-${studentId}`;
          
          // Update the matched session object
          matchingSession = {
            id: studentSessionId,
            studentName,
            questions: verificationQuestions,
            assignmentName: row.assignment_name,
            courseCode: row.course_code
          };
          
          console.log(`Matched code ${code} to student ${studentName} with ${verificationQuestions.length} questions`);
          break;
        }
      }
      
      if (!matchingSession) {
        console.log(`No real session found with code ${code}, falling back to mock data`);
        
        // Fall back to mock data
        const mockSession = mockSessions.find(s => 
          s.verificationCode && s.verificationCode.toUpperCase() === code.toUpperCase()
        );
        
        if (!mockSession) {
          return res.status(400).json({ error: 'Invalid verification code' });
        }
        
        console.log('Found mock session:', mockSession.id);
        
        // Check if session is already completed
        if (mockSession.status === 'completed') {
          console.log('Session is already completed:', mockSession.id);
          return res.status(400).json({ error: 'This session has been completed' });
        }
        
        // Get questions for the session
        const questions = mockQuestions.filter(q => 
          q.sessionId === mockSession.id && !q.answered
        );
        
        console.log('Found mock questions:', questions.length);
        
        // Return session and questions
        return res.status(200).json({ 
          sessionId: mockSession.id,
          currentQuestionIndex: 0,
          isComplete: false,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            answer: null
          }))
        });
      }
      
      // Format questions for the student
      const studentIdPart = studentSessionId.split('-').slice(2).join('-'); // Extract "student-74696765" part
      const formattedQuestions = verificationQuestions.map((q: string, index: number) => ({
        id: `question-${index}-${studentId}`,
        text: q,
        answer: null
      }));
      
      console.log(`Returning ${formattedQuestions.length} questions for session ${studentSessionId}`);
      console.log('Question IDs:');
      formattedQuestions.forEach(q => console.log(`- ${q.id}`));
      
      return res.status(200).json({
        sessionId: studentSessionId,
        currentQuestionIndex: 0,
        isComplete: false,
        questions: formattedQuestions
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