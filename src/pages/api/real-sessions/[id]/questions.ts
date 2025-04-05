import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  console.log(`Processing request for session questions: ${id}`);

  // Parse the session ID to extract the assignment ID and student ID
  const matches = id.match(/^session-(\d+)-student-(.+)$/);
  
  if (!matches || matches.length < 3) {
    console.log(`Invalid session ID format: ${id}`);
    return getTestQuestions(res);
  }
  
  const assignmentId = parseInt(matches[1]);
  const studentIdHex = matches[2];

  console.log(`Looking for questions for assignment ID ${assignmentId} and student ID hex ${studentIdHex}`);

  if (req.method === 'GET') {
    try {
      // Connect to the database
      const conn = await getConnection();

      try {
        // Query the database to get submission details
        const [submissionRows] = await conn.query(`
          SELECT 
            sd.id as submission_id,
            JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_name')) as student_name,
            JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email,
            JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') as verification_questions_json
          FROM 
            submission_detail_table sd
          WHERE 
            sd.assignment_id = ? AND
            JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') IS NOT NULL
          LIMIT 1
        `, [assignmentId]);
        
        if (!submissionRows || (submissionRows as any[]).length === 0) {
          console.log('No matching submission found in database');
          return getTestQuestions(res);
        }

        const submission = (submissionRows as any[])[0];
        console.log(`Found submission for ${submission.student_name}`);
        
        try {
          // Parse JSON data that needs parsing
          const studentName = submission.student_name;
          const studentEmail = submission.student_email;
          
          // Handle verification questions - could be JSON array or raw string
          let verificationQuestions: string[] = [];
          
          try {
            // First try parsing as JSON
            verificationQuestions = JSON.parse(submission.verification_questions_json);
            console.log(`Successfully parsed JSON questions for ${studentName}`);
          } catch (parseError) {
            // Not a JSON array, check if it's a string that looks like an array
            const questionsStr = submission.verification_questions_json.toString();
            
            if (questionsStr.startsWith('[') && questionsStr.endsWith(']')) {
              // It looks like a JSON array but parsing failed, try to clean it
              try {
                verificationQuestions = JSON.parse(questionsStr.replace(/\n/g, '\\n'));
                console.log(`Parsed cleaned JSON questions for ${studentName}`);
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
                  console.log(`Split string into ${verificationQuestions.length} questions for ${studentName}`);
                } else {
                  // Just use the whole string as one question
                  verificationQuestions = [cleanedStr];
                  console.log(`Using full string as one question for ${studentName}`);
                }
              }
            }
          }
          
          // If we still don't have any questions, use a fallback
          if (!verificationQuestions || verificationQuestions.length === 0) {
            console.log(`No verification questions found for ${studentName}, using fallback`);
            verificationQuestions = [
              "Please explain your approach to this assignment.",
              "What resources did you use while completing this work?",
              "How would you demonstrate that this work is original?"
            ];
          }
          
          // Generate a student ID from the email
          const studentId = `student-${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`;
          
          // Check if the student ID matches the one in the session ID
          if (studentIdHex !== Buffer.from(studentEmail).toString('hex').substring(0, 8)) {
            console.log(`Student ID mismatch: ${studentIdHex} vs ${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`);
            return getTestQuestions(res);
          }
          
          // Create a verification code for the student
          const verificationCode = `${studentName.charAt(0)}${studentId.slice(-4)}`;
          
          // Create formatted questions for the student
          const questions = verificationQuestions.map((q: string, index: number) => ({
            id: `question-${submission.submission_id}-${index}`,
            text: q,
            verificationCode: {
              code: verificationCode
            },
            answer: null
          }));

          console.log(`Returning ${questions.length} questions for ${studentName}`);
          return res.status(200).json(questions);
        } catch (error) {
          console.error('Error processing questions data:', error);
          return getTestQuestions(res);
        }
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      return getTestQuestions(res);
    }
  } else if (req.method === 'POST') {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      // Create a new question with a random ID
      const newQuestion = {
        id: `question-${uuidv4()}`,
        text,
        verificationCode: {
          code: `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        },
        answer: null
      };

      console.log(`Created new question: ${text}`);
      return res.status(201).json(newQuestion);
    } catch (error) {
      console.error('Error creating question:', error);
      return res.status(500).json({ error: 'Failed to create question' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper function to return test questions
function getTestQuestions(res: NextApiResponse) {
  const verificationQuestions = [
    "How does LangGraph's approach to modeling LLM agents as customizable, composable graphs differ from traditional static LLM applications, and what implications does this have for their functionality in dynamic environments?",
    "Can you explain how the stateful nature of agents created with LangGraph enhances their ability to reason and make decisions over time, providing an example of a potential application where this feature would be particularly beneficial?",
    "In your conclusion, you mention that LangGraph represents a shift toward intelligent, interactive systems. What specific features or capabilities of LangGraph do you believe are most critical in achieving this shift, and why do you find them compelling based on your analysis?"
  ];
  
  // Create formatted questions for the student
  const questions = verificationQuestions.map((q, index) => ({
    id: `question-1-${index}`,
    text: q,
    verificationCode: {
      code: 'R8'
    },
    answer: null
  }));

  console.log(`Returning ${questions.length} test questions`);
  return res.status(200).json(questions);
} 