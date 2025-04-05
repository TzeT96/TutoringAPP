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

  const { school, course } = req.query;

  if (!school || !course || typeof school !== 'string' || typeof course !== 'string') {
    return res.status(400).json({ error: 'School and course code are required' });
  }

  console.log(`Fetching sessions for school: ${school}, course: ${course}`);

  try {
    // Connect to the database
    const conn = await getConnection();
    console.log('Connected to database');
    
    try {
      // Get submissions with verification questions for this course
      const [rows] = await conn.query(`
        SELECT 
          sd.id as submission_id,
          sd.assignment_id,
          JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_name')) as student_name,
          JSON_UNQUOTE(JSON_EXTRACT(sd.submission_detection_result, '$.student_email')) as student_email,
          JSON_EXTRACT(sd.submission_detection_result, '$.ai_probability') as ai_probability,
          JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') as verification_questions_json,
          agi.course_code,
          agi.school
        FROM 
          submission_detail_table sd
        JOIN
          assignment_general_info_table agi ON sd.assignment_id = agi.id
        WHERE 
          agi.school = ? AND 
          (agi.course_code = ? OR agi.course_code LIKE CONCAT(?, '%') OR REPLACE(agi.course_code, ' ', '') = ?) AND
          JSON_EXTRACT(sd.submission_detection_result, '$.verification_questions') IS NOT NULL
        ORDER BY 
          sd.submission_time DESC
      `, [school, course, course, course.replace(/\s+/g, '')]);
      
      console.log(`Found ${(rows as any[]).length} submissions with verification questions`);
      
      // Get assignment info for the course
      const [assignmentRows] = await conn.query(`
        SELECT 
          id, 
          assignment_name, 
          assignment_type, 
          course_code, 
          school
        FROM 
          assignment_general_info_table
        WHERE
          school = ? AND 
          (course_code = ? OR course_code LIKE CONCAT(?, '%') OR REPLACE(course_code, ' ', '') = ?)
      `, [school, course, course, course.replace(/\s+/g, '')]);
      
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
            course_code: row.course_code || course,
            school: row.school || school
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
          
          // Generate a random 4-digit number
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          const verificationCode = `${studentName.charAt(0)}${randomDigits}`;
          
          // Add logging for troubleshooting
          console.log(`Generated verification code ${verificationCode} for student ${studentName} (${studentEmail})`);
          
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
        const courseId = `course-${course.replace(/\s+/g, '-').toLowerCase()}`;
        const studentId = 'student-12345678';
        const testSession: Session = {
          id: 'session-1-student-12345678',
          courseId,
          course: course,
          assignmentId: 'assignment-1',
          assignment: 'Test Assignment',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          students: [
            {
              id: studentId,
              name: 'Test Student',
              email: 'test@example.com',
              riskLevel: 'high',
              emailStatus: 'pending',
              plagiarismStatus: 'confirmed',
              status: 'pending',
              verificationCode: 'T8'
            }
          ],
          plagiarismCase: {
            assignmentType: 'Assignment',
            similarityScore: 78,
            description: `Suspected plagiarism in Test Assignment`,
            studentQuestions: [
              {
                studentId,
                studentName: 'Test Student',
                questions: [
                  "Can you explain your approach to this assignment?",
                  "What resources did you use while completing this work?",
                  "How would you demonstrate that this work is original?"
                ]
              }
            ]
          },
          verificationCode: 'T8'
        };
        sessions.push(testSession);
      }
      
      console.log(`Returning ${sessions.length} sessions for ${school}/${course}`);
      return res.status(200).json(sessions);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
} 