import { NextApiRequest, NextApiResponse } from 'next';
import { Session, Student, StudentQuestions } from '@/data/mockData';
import { getConnection } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to the database
    const conn = await getConnection();
    console.log('Connected to database');
    
    try {
      // Get submissions with verification questions
      const [rows] = await conn.query(`
        SELECT 
          sd.id as submission_id,
          sd.assignment_id,
          JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_name')) as student_name,
          JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email,
          JSON_EXTRACT(sd.submission_detection_result, '$.ai_probability') as ai_probability,
          JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') as verification_questions_json
        FROM 
          submission_detail_table sd
        WHERE 
          JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') IS NOT NULL
        ORDER BY 
          sd.submission_time DESC
      `);
      
      console.log(`Found ${(rows as any[]).length} submissions with verification questions`);
      
      // Get assignment info
      const [assignmentRows] = await conn.query(`
        SELECT 
          id, 
          assignment_name, 
          assignment_type, 
          course_code, 
          school
        FROM 
          assignment_general_info_table
      `);
      
      // Create a map of assignment ID to assignment info
      const assignmentMap = new Map();
      for (const row of assignmentRows as any[]) {
        assignmentMap.set(row.id, row);
      }
      
      console.log(`Found ${assignmentMap.size} assignments`);
      
      // Create sessions from the data
      const sessions: Session[] = [];
      
      for (const row of rows as any[]) {
        try {
          const assignment = assignmentMap.get(row.assignment_id) || {
            assignment_name: 'Unknown Assignment',
            assignment_type: 'Assignment',
            course_code: 'Unknown Course',
            school: 'Unknown School'
          };
          
          const studentName = row.student_name;
          const studentEmail = row.student_email;
          const aiProbability = parseFloat(row.ai_probability || '0.7');
          
          // Handle verification questions - could be JSON array or raw string
          let verificationQuestions: string[] = [];
          
          try {
            // First try parsing as JSON
            verificationQuestions = JSON.parse(row.verification_questions_json);
            console.log(`Successfully parsed JSON questions for ${studentName}`);
          } catch (parseError) {
            // Not a JSON array, check if it's a string that looks like an array
            const questionsStr = row.verification_questions_json.toString();
            
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
          
          // Skip if no questions
          if (!verificationQuestions || verificationQuestions.length === 0) {
            console.log(`No verification questions for ${studentName}, skipping`);
            continue;
          }
          
          // Generate a student ID from the email
          const studentId = `student-${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`;
          
          // Determine plagiarism status based on AI probability
          let plagiarismStatus: 'cleared' | 'suspected' | 'confirmed' = 'cleared';
          if (aiProbability >= 0.8) {
            plagiarismStatus = 'confirmed';
          } else if (aiProbability >= 0.6) {
            plagiarismStatus = 'suspected';
          }
          
          // Check for existing verification code in the database
          let verificationCode = '';
          
          // Get tutoring_answer for this submission to see if a verification code exists
          const [tutoringResults] = await conn.query(
            'SELECT tutoring_answer FROM submission_detail_table WHERE id = ?',
            [row.submission_id]
          );
          
          if (tutoringResults && (tutoringResults as any[]).length > 0) {
            const tutoringAnswer = (tutoringResults as any)[0].tutoring_answer;
            
            if (tutoringAnswer) {
              try {
                // Try to parse the tutoring_answer JSON
                const parsedAnswer = typeof tutoringAnswer === 'string'
                  ? JSON.parse(tutoringAnswer)
                  : tutoringAnswer;
                
                if (parsedAnswer.verificationCode) {
                  verificationCode = parsedAnswer.verificationCode;
                  console.log(`Found existing verification code ${verificationCode} for ${studentName}`);
                }
              } catch (e) {
                console.error(`Error parsing tutoring_answer JSON: ${e}`);
              }
            }
          }
          
          // If no verification code found, generate a deterministic one
          if (!verificationCode) {
            // Generate a deterministic code using the first letter of name and hash of email
            const emailHash = Buffer.from(studentEmail).toString('hex');
            const hashSum = emailHash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const randomDigits = 1000 + (hashSum % 9000); // Generate a 4-digit number between 1000-9999 based on email
            verificationCode = `${studentName.charAt(0)}${randomDigits}`;
            console.log(`Generated deterministic verification code ${verificationCode} for student ${studentName} (${studentEmail})`);
            
            // Store the verification code for future use
            try {
              await conn.query(`
                UPDATE submission_detail_table
                SET tutoring_answer = JSON_SET(
                  COALESCE(tutoring_answer, '{}'),
                  '$.verificationCode', ?
                )
                WHERE id = ?
              `, [verificationCode, row.submission_id]);
              console.log(`Stored verification code ${verificationCode} in database for submission ${row.submission_id}`);
            } catch (error) {
              console.error('Error storing verification code:', error);
            }
          }
          
          // Create the student object
          const student: Student = {
            id: studentId,
            name: studentName,
            email: studentEmail,
            riskLevel: plagiarismStatus === 'confirmed' ? 'high' : (plagiarismStatus === 'suspected' ? 'medium' : 'low'),
            emailStatus: 'pending',
            plagiarismStatus,
            status: 'pending',
            verificationCode
          };
          
          // Create the student questions object
          const studentQuestion: StudentQuestions = {
            studentId,
            studentName,
            questions: verificationQuestions
          };
          
          // Create a unique session ID
          const sessionId = `session-${row.submission_id}-${studentId}`;
          
          // Create the session
          const session: Session = {
            id: sessionId,
            courseId: `course-${assignment.course_code.replace(/\s+/g, '-').toLowerCase()}`,
            course: assignment.course_code,
            assignmentId: `assignment-${row.assignment_id}`,
            assignment: assignment.assignment_name,
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            status: 'scheduled',
            students: [student],
            plagiarismCase: {
              assignmentType: assignment.assignment_type,
              similarityScore: Math.round(aiProbability * 100),
              description: `Suspected plagiarism in ${assignment.assignment_name}`,
              studentQuestions: [studentQuestion]
            },
            verificationCode
          };
          
          sessions.push(session);
          console.log(`Created session for ${studentName}`);
        } catch (error) {
          console.error('Error processing row:', error, row);
        }
      }
      
      if (sessions.length === 0) {
        // Include a test session if we couldn't create any real ones
        console.log("No valid sessions created, adding a test session");
        const studentId = 'student-12345678';
        const testSession: Session = {
          id: 'session-1-student-12345678',
          courseId: 'course-aristai-plagiarism',
          course: 'AristAI-Plagiarism',
          assignmentId: 'assignment-1',
          assignment: 'Test Assignment + Description',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          students: [
            {
              id: studentId,
              name: 'Ryan Wang',
              email: 'tigerryan21@gmail.com',
              riskLevel: 'high',
              emailStatus: 'pending',
              plagiarismStatus: 'confirmed',
              status: 'pending',
              verificationCode: 'R8'
            }
          ],
          plagiarismCase: {
            assignmentType: 'Assignment',
            similarityScore: 78,
            description: 'Suspected plagiarism in Test Assignment + Description',
            studentQuestions: [
              {
                studentId,
                studentName: 'Ryan Wang',
                questions: [
                  "How does LangGraph's approach to modeling LLM agents as customizable, composable graphs differ from traditional static LLM applications, and what implications does this have for their functionality in dynamic environments?",
                  "Can you explain how the stateful nature of agents created with LangGraph enhances their ability to reason and make decisions over time, providing an example of a potential application where this feature would be particularly beneficial?",
                  "In your conclusion, you mention that LangGraph represents a shift toward intelligent, interactive systems. What specific features or capabilities of LangGraph do you believe are most critical in achieving this shift, and why do you find them compelling based on your analysis?"
                ]
              }
            ]
          },
          verificationCode: 'R8'
        };
        sessions.push(testSession);
      }
      
      console.log(`Returning ${sessions.length} sessions`);
      return res.status(200).json(sessions);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
} 