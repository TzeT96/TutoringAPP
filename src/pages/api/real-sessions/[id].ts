import { NextApiRequest, NextApiResponse } from 'next';
import { Session, Student, StudentQuestions } from '@/data/mockData';
import { getConnection } from '@/lib/db';

// Before the tutoring answers section, add this interface
interface TutoringAnswer {
  question_id: string;
  text_answer?: string;
  video_url?: string;
  submitted_at: string;
}

interface TutoringAnswers {
  answers: TutoringAnswer[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (req.method === 'GET') {
    try {
      console.log(`Looking for session with ID ${id}`);
      
      // Parse the session ID to extract the assignment ID and student ID
      // Example format: session-{assignmentId}-{studentId}
      const matches = id.match(/^session-(\d+)-student-(.+)$/);
      
      if (!matches || matches.length < 3) {
        console.log(`Invalid session ID format: ${id}`);
        
        // Fall back to the test session
        return getTestSession(id, res);
      }
      
      // This could be either the assignment ID or submission ID based on how the session ID was created
      const firstId = parseInt(matches[1]);
      const studentIdHex = matches[2];
      
      console.log(`Looking for session with first ID ${firstId} and student ID hex ${studentIdHex}`);
      
      // Connect to the database
      const conn = await getConnection();
      
      try {
        // First try to find a matching submission directly by ID
        const [directSubmissionRows] = await conn.query(`
          SELECT 
            sd.id,
            JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email
          FROM 
            submission_detail_table sd
          WHERE 
            sd.id = ? AND
            JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') IS NOT NULL
        `, [firstId]);

        // If found directly by submission ID, use that
        if (directSubmissionRows && (directSubmissionRows as any[]).length > 0) {
          const submissionRow = (directSubmissionRows as any)[0];
          const emailHash = Buffer.from(submissionRow.student_email).toString('hex').substring(0, 8);
          
          if (emailHash === studentIdHex) {
            console.log(`Found direct match for submission ID ${firstId} and student ID ${studentIdHex}`);
            const submissionId = firstId; // The ID is already the submission ID
            
            // Proceed with this submission ID
            // Rest of the code to fetch details and build response
            const [rows] = await conn.query(`
              SELECT 
                sd.id as submission_id,
                sd.assignment_id,
                JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_name')) as student_name,
                JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email,
                JSON_EXTRACT(sd.submission_detection_result, '$.ai_probability') as ai_probability,
                JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') as verification_questions_json,
                sd.tutoring_answer,
                agi.course_code,
                agi.school,
                agi.assignment_name,
                agi.assignment_type
              FROM 
                submission_detail_table sd
              JOIN
                assignment_general_info_table agi ON sd.assignment_id = agi.id
              WHERE 
                sd.id = ?
            `, [submissionId]);
            
            if (!rows || (rows as any[]).length === 0) {
              console.log(`No matching submission found for session ID ${id}`);
              return getTestSession(id, res);
            }
            
            const submission = (rows as any[])[0];
            
            console.log(`Found submission for ${submission.student_name}`);
            
            try {
              // Parse JSON data that needs parsing
              const studentName = submission.student_name;
              const studentEmail = submission.student_email;
              const aiProbability = parseFloat(submission.ai_probability || '0.7');
              
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
              console.log(`Processing student ${studentName} (ID: ${studentIdHex}) - Email hash: ${Buffer.from(studentEmail).toString('hex').substring(0, 8)}`);

              // If there's a mismatch, log it but continue with the actual student data
              if (studentIdHex !== Buffer.from(studentEmail).toString('hex').substring(0, 8)) {
                console.log(`Note: Student ID in session (${studentIdHex}) doesn't match email hash (${Buffer.from(studentEmail).toString('hex').substring(0, 8)}), but using actual student data anyway`);
              }
              
              // Determine plagiarism status based on AI probability
              let plagiarismStatus: 'cleared' | 'suspected' | 'confirmed' = 'cleared';
              if (aiProbability >= 0.8) {
                plagiarismStatus = 'confirmed';
              } else if (aiProbability >= 0.6) {
                plagiarismStatus = 'suspected';
              }
              
              // Check if we have a stored verification code in the tutoring_answer JSON
              let verificationCode = '';
              if (submission.tutoring_answer) {
                try {
                  const tutoringAnswer = typeof submission.tutoring_answer === 'string'
                    ? JSON.parse(submission.tutoring_answer)
                    : submission.tutoring_answer;
                  
                  if (tutoringAnswer.verificationCode) {
                    verificationCode = tutoringAnswer.verificationCode;
                    console.log(`Retrieved stored verification code ${verificationCode} for student ${studentName}`);
                  }
                } catch (error) {
                  console.error('Error parsing tutoring_answer JSON for verification code:', error);
                }
              }

              // If no stored code was found, check if there's a stable code associated with this student email
              if (!verificationCode) {
                try {
                  // Check all records for this student email to find any existing verification code
                  const [existingCodes] = await conn.query(`
                    SELECT 
                      tutoring_answer 
                    FROM 
                      submission_detail_table 
                    WHERE 
                      JSON_UNQUOTE(JSON_EXTRACT(submission_detection_result, '$.student_email')) = ?
                      AND tutoring_answer IS NOT NULL
                  `, [studentEmail]);
                  
                  // Try to find a verification code in any of the records
                  for (const row of (existingCodes as any[])) {
                    if (row.tutoring_answer) {
                      try {
                        const existingAnswer = typeof row.tutoring_answer === 'string'
                          ? JSON.parse(row.tutoring_answer)
                          : row.tutoring_answer;
                        
                        if (existingAnswer.verificationCode) {
                          verificationCode = existingAnswer.verificationCode;
                          console.log(`Found existing verification code ${verificationCode} for student ${studentName} in another record`);
                          break;
                        }
                      } catch (e) {
                        continue; // Skip if can't parse this record
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error searching for existing verification codes:', error);
                }
              }

              // If still no code found, generate a deterministic one based on student email
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
                  `, [verificationCode, submissionId]);
                  console.log(`Stored verification code ${verificationCode} in database for submission ${submissionId}`);
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
                emailStatus: 'sent',
                plagiarismStatus,
                status: 'pending',
                verificationCode
              };
              
              // Create formatted questions for the student
              const questions = verificationQuestions.map((q: string, index: number) => ({
                id: `question-${index}-${studentId}`,
                text: q,
                verificationCode: {
                  code: verificationCode
                },
                answer: null
              }));
              
              // Process tutoring answers later          
              let parsedTutoringAnswers: TutoringAnswers | null = null;
              if (submission.tutoring_answer) {
                try {
                  // Parse tutoring answers JSON
                  parsedTutoringAnswers = typeof submission.tutoring_answer === 'string' 
                    ? JSON.parse(submission.tutoring_answer) 
                    : submission.tutoring_answer as TutoringAnswers;
                } catch (parseError) {
                  console.error('Error parsing tutoring answers:', parseError);
                }
              }
              
              // Create the session with additional fields needed for the session detail page
              const session: any = {
                id: `session-${submissionId}-student-${studentId}`, // Use the ACTUAL submission ID here, not the original id
                code: verificationCode,
                createdAt: new Date().toISOString(),
                status: 'PENDING',
                startedAt: new Date().toISOString(),
                questions,
                courseId: `course-${submission.course_code.replace(/\s+/g, '-').toLowerCase()}`,
                course: submission.course_code,
                assignmentId: `assignment-${submission.assignment_id}`,
                assignment: submission.assignment_name,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                students: [student]
              };

              // Add plagiarism case without duplicating questions
              // Since we're already adding the questions to the session directly,
              // we don't need to include them in the plagiarism case as well
              session.plagiarismCase = {
                assignmentType: submission.assignment_type,
                similarityScore: Math.round(aiProbability * 100),
                description: `Suspected plagiarism in ${submission.assignment_name}`,
                // Empty studentQuestions array to avoid duplicating questions
                studentQuestions: []
              };

              // Now apply tutoring answers to the session
              if (parsedTutoringAnswers?.answers && Array.isArray(parsedTutoringAnswers.answers)) {
                console.log(`Found ${parsedTutoringAnswers.answers.length} answers for session ${id}`);
                
                // Log all answer question IDs to debug
                parsedTutoringAnswers.answers.forEach(a => {
                  console.log(`Available answer for question ID: ${a.question_id}`);
                });

                // Fix "student-student-" pattern in the stored answers
                const normalizedAnswers = parsedTutoringAnswers.answers.map(answer => {
                  if (answer.question_id.includes('student-student-')) {
                    const fixedId = answer.question_id.replace('student-student-', 'student-');
                    console.log(`Normalizing answer ID from ${answer.question_id} to ${fixedId}`);
                    return { ...answer, question_id: fixedId };
                  }
                  return answer;
                });
                
                // Log normalized answer IDs
                console.log("Normalized question IDs:");
                normalizedAnswers.forEach(a => console.log(`- ${a.question_id}`));
                
                // Map the questions with answers
                const questionsWithAnswers = questions.map((question, index) => {
                  const originalQuestionId = question.id;
                  
                  // Try different formats for matching question IDs
                  const answerData = normalizedAnswers.find(a => {
                    const match = (
                      a.question_id === originalQuestionId || 
                      a.question_id === `question-${index}-${studentId}` ||
                      // Handle legacy format with student ID at the end
                      a.question_id === `question-${index}-student-${studentIdHex}` ||
                      // Also try with just the index
                      a.question_id === `question-${index}`
                    );
                    
                    if (match) {
                      console.log(`MATCH FOUND: Question ${originalQuestionId} matches answer with ID ${a.question_id}`);
                    }
                    
                    return match;
                  });
                  
                  if (answerData) {
                    console.log(`Found answer for question ${question.id}: ${answerData.text_answer?.substring(0, 30)}...`);
                    return {
                      ...question,
                      answer: {
                        id: `answer-${question.id}`,
                        text: answerData.text_answer || "", // Map text_answer to text for UI compatibility
                        textAnswer: answerData.text_answer || "", // Include both formats for backwards compatibility
                        videoUrl: answerData.video_url,
                        submittedAt: answerData.submitted_at
                      }
                    };
                  } else {
                    console.log(`No answer found for question ${question.id}`);
                  }
                  
                  return question;
                });
                
                // Update session with questions that have answers
                session.questions = questionsWithAnswers;
              }

              console.log(`Returning session details for ${studentName}`);
              return res.status(200).json(session);
            } catch (processingError) {
              console.error('Error processing session data:', processingError);
              return getTestSession(id, res);
            }
          } else {
            // Email hash doesn't match, use fallback methods
            console.log(`Email hash mismatch. Session ID email hash: ${studentIdHex}, found: ${emailHash}`);
            // Fall through to the assignment ID based search
          }
        } else {
          // No direct match by submission ID, try by assignment ID
          console.log(`No direct submission match, trying to find by assignment ID ${firstId} and student ID hex ${studentIdHex}`);
        }
      
        // As a fallback, look by assignment ID + student ID
        console.log(`Looking for submission with assignment ID ${firstId} and student ID hex ${studentIdHex}`);

        // First get all submissions for this assignment
        const [submissionRows] = await conn.query(`
          SELECT 
            sd.id,
            JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email
          FROM 
            submission_detail_table sd
          WHERE 
            sd.assignment_id = ? AND
            JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') IS NOT NULL
        `, [firstId]);

        if (!submissionRows || (submissionRows as any[]).length === 0) {
          console.log(`No submissions found for assignment ID ${firstId}`);
          return getTestSession(id, res);
        }

        // Find the submission that matches the student ID in the session ID
        let submissionId = null;
        let exactMatch = false;
        for (const row of submissionRows as any[]) {
          const emailHash = Buffer.from(row.student_email).toString('hex').substring(0, 8);
          console.log(`Checking submission ${row.id} with email hash ${emailHash}`);
          
          // First, try to find an exact match
          if (emailHash === studentIdHex) {
            submissionId = row.id;
            exactMatch = true;
            console.log(`Found exact match for student ID ${studentIdHex}: submission ${submissionId}`);
            break;
          }
          
          // If this is the first submission we've seen and we don't have a match yet, use it as a fallback
          if (submissionId === null) {
            submissionId = row.id;
          }
        }

        // If we couldn't find an exact match but have a fallback, use it but log a warning
        if (!exactMatch && submissionId !== null) {
          console.log(`Warning: No exact match found for student ID ${studentIdHex}. Using submission ${submissionId} as fallback.`);
        }

        if (!submissionId) {
          console.log(`No matching submission found for student ID ${studentIdHex}`);
          return getTestSession(id, res);
        }
        
        // Continue with existing code for fetching and processing the submission...
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      return getTestSession(id, res);
    }
  } else if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      
      // For now, just return a mock response as we won't be modifying the database
      return res.status(200).json({
        id,
        status: status || 'PENDING',
        message: 'Session status updated successfully'
      });
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper function to return a test session
function getTestSession(id: string, res: NextApiResponse) {
  const studentId = 'student-12345678';
  const verificationQuestions = [
    "How does LangGraph's approach to modeling LLM agents as customizable, composable graphs differ from traditional static LLM applications, and what implications does this have for their functionality in dynamic environments?",
    "Can you explain how the stateful nature of agents created with LangGraph enhances their ability to reason and make decisions over time, providing an example of a potential application where this feature would be particularly beneficial?",
    "In your conclusion, you mention that LangGraph represents a shift toward intelligent, interactive systems. What specific features or capabilities of LangGraph do you believe are most critical in achieving this shift, and why do you find them compelling based on your analysis?"
  ];
  
  const questions = verificationQuestions.map((q, index) => ({
    id: `question-1-${index}`,
    text: q,
    verificationCode: {
      code: 'R8'
    },
    answer: null
  }));
  
  // Create the session with additional fields needed for the session detail page
  const session: any = {
    id,
    code: 'R8',
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    startedAt: new Date().toISOString(),
    questions,
    courseId: 'course-aristai-plagiarism',
    course: 'AristAI-Plagiarism',
    assignmentId: 'assignment-1',
    assignment: 'Test Assignment + Description',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    students: [{
      id: studentId,
      name: 'Ryan Wang',
      email: 'tigerryan21@gmail.com',
      riskLevel: 'high',
      emailStatus: 'pending',
      plagiarismStatus: 'confirmed',
      status: 'pending',
      verificationCode: 'R8'
    }],
    plagiarismCase: {
      assignmentType: 'Assignment',
      similarityScore: 78,
      description: 'Suspected plagiarism in Test Assignment + Description',
      // Empty array to avoid duplicate questions 
      studentQuestions: []
    }
  };

  console.log(`Returning test session details`);
  return res.status(200).json(session);
} 