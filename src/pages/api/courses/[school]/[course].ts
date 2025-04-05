import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

interface CourseData {
  id: number;
  assignment_name: string;
  assignment_type: string;
  due_date: Date;
  course_code: string;
  school: string;
  assignment_url: string;
  submissions: {
    id: number;
    submission_detection_result: any;
    submission_time: Date;
  }[];
}

interface TransformedCourse {
  id: string;
  name: string;
  code: string;
  school: string;
  semester: string;
  studentCount: number;
  highRiskCount: number;
  averageGrade: number;
  assignments: {
    id: string;
    title: string;
    type: string;
    dueDate: Date;
    totalPoints: number;
    studentResults: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      score: number;
      submissionDate: Date;
      plagiarismStatus: string;
      similarityScore: number;
      requiresVerification: boolean;
      verificationQuestions?: string[];
      canvasUrl?: string;
    }[];
  }[];
  students: {
    id: string;
    name: string;
    email: string;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { school, course } = req.query;

  if (!school || !course || typeof school !== 'string' || typeof course !== 'string') {
    return res.status(400).json({ error: 'School and course parameters are required' });
  }

  try {
    // Normalize the course code by removing spaces and converting to uppercase
    const normalizedCourseCode = course.replace(/\s+/g, '').toUpperCase();
    const normalizedSchool = school.toUpperCase();
    
    // Find the course with case-insensitive matching using raw SQL
    const courseData = await prisma.$queryRaw<CourseData[]>`
      SELECT a.*, 
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', s.id,
              'submission_detection_result', s.submission_detection_result,
              'submission_time', s.submission_time
            )
          ),
          JSON_ARRAY()
        ) as submissions
      FROM assignment_general_info_table a
      LEFT JOIN submission_detail_table s ON a.id = s.assignment_id
      WHERE UPPER(REPLACE(a.course_code, ' ', '')) = ${normalizedCourseCode}
      AND UPPER(a.school) = ${normalizedSchool}
      GROUP BY a.id, a.assignment_name, a.assignment_type, a.due_date, a.course_code, a.school, a.assignment_url
    `;

    if (!courseData || courseData.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Transform the data for the frontend
    const transformedCourse: TransformedCourse = {
      id: courseData[0].course_code,
      name: courseData[0].assignment_name,
      code: courseData[0].course_code,
      school: normalizedSchool,
      semester: 'Current', // We don't have semester info in the database
      studentCount: 0, // We'll calculate this from submissions
      highRiskCount: 0, // We'll calculate this from submissions
      averageGrade: 0, // We don't have grade info in the database
      assignments: courseData.map(assignment => {
        let submissions = [];
        try {
          submissions = typeof assignment.submissions === 'string' 
            ? JSON.parse(assignment.submissions) 
            : assignment.submissions;
        } catch (error) {
          console.error('Error parsing submissions:', error);
          submissions = [];
        }

        const studentResults = submissions.map((sub: any) => {
          let detectionResult = null;
          
          try {
            const parsedResult = typeof sub.submission_detection_result === 'string' 
              ? JSON.parse(sub.submission_detection_result) 
              : sub.submission_detection_result;

            if (parsedResult) {
              detectionResult = parsedResult;
            }
          } catch (error) {
            console.error('Error parsing submission_detection_result:', error);
            return null; // Skip this submission if we can't parse it
          }

          // Skip submissions without valid student data
          if (!detectionResult || !detectionResult.student_email || !detectionResult.student_name) {
            return null;
          }

          // Determine plagiarism status based on AI probability
          let plagiarismStatus = 'cleared';
          if (detectionResult.ai_probability >= 0.8) {
            plagiarismStatus = 'confirmed';
          } else if (detectionResult.ai_probability >= 0.6) {
            plagiarismStatus = 'suspected';
          }

          return {
            studentId: detectionResult.student_email,
            studentName: detectionResult.student_name,
            studentEmail: detectionResult.student_email,
            score: 0, // We don't have score information
            submissionDate: sub.submission_time,
            plagiarismStatus,
            similarityScore: Math.round(detectionResult.ai_probability * 100),
            requiresVerification: detectionResult.requires_verification === 1,
            verificationQuestions: detectionResult.verification_questions,
            canvasUrl: detectionResult.canvas_url
          };
        }).filter((result: any) => result !== null) as Array<{
          studentId: string;
          studentName: string;
          studentEmail: string;
          score: number;
          submissionDate: Date;
          plagiarismStatus: string;
          similarityScore: number;
          requiresVerification: boolean;
          verificationQuestions?: string[];
          canvasUrl?: string;
        }>;

        return {
          id: assignment.id.toString(),
          title: assignment.assignment_name,
          type: assignment.assignment_type.toLowerCase(),
          dueDate: assignment.due_date,
          totalPoints: 100, // Default value since we don't have this in the database
          studentResults
        };
      }),
      students: [] // We'll extract unique students from submissions
    };

    // Calculate statistics
    const uniqueStudents = new Set<string>();
    let highRiskCount = 0;

    transformedCourse.assignments.forEach(assignment => {
      assignment.studentResults.forEach(result => {
        uniqueStudents.add(result.studentEmail);
        if (result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed') {
          highRiskCount++;
        }
      });
    });

    transformedCourse.studentCount = uniqueStudents.size;
    transformedCourse.highRiskCount = highRiskCount;
    transformedCourse.students = Array.from(uniqueStudents).map(email => ({
      id: email,
      name: transformedCourse.assignments
        .flatMap(a => a.studentResults)
        .find(r => r.studentEmail === email)?.studentName || 'Unknown Student',
      email
    }));

    return res.status(200).json(transformedCourse);
  } catch (error) {
    console.error('Error fetching course data:', error);
    return res.status(500).json({ error: 'Failed to fetch course data' });
  }
} 