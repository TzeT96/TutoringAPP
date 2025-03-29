import { NextApiRequest, NextApiResponse } from 'next';
import { ExtendedCourse } from '@/lib/admin-data-service';
import prisma from '@/lib/prisma';

// Interface for perplexity sentence data
interface PerplexitySentence {
  sentence: string;
  perplexity: number;
}

// Interface for submission detection result
interface SubmissionDetectionResult {
  burstiness: number;
  canvas_url: string;
  perplexity: number;
  student_name: string;
  student_email: string;
  ai_probability: number;
  requires_verification: number;
  verification_questions: string[];
  top_5_lowest_perplexity_sentences: PerplexitySentence[];
  top_5_highest_perplexity_sentences: PerplexitySentence[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedCourse[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取所有提交记录和作业信息
    const submissions = await prisma.submissionDetail.findMany();
    const assignments = await prisma.assignmentGeneralInfo.findMany();
    
    if (submissions.length === 0 || assignments.length === 0) {
      return res.json([]);
    }

    // 按课程代码组织数据
    const courseMap = new Map<string, ExtendedCourse>();

    assignments.forEach((assignment) => {
      const courseCode = assignment.course_code || '';
      
      // 如果这个课程还没有被处理过，创建新的课程对象
      if (!courseMap.has(courseCode)) {
        courseMap.set(courseCode, {
          id: courseCode,
          code: courseCode,
          name: courseCode,
          semester: 'Current',
          studentCount: 0,
          assignments: [],
          students: [],
          highRiskCount: 0,
          averageGrade: undefined
        });
      }

      // 找到这个作业相关的所有提交
      const assignmentSubmissions = submissions.filter(
        (sub) => sub.assignment_id === assignment.id
      );

      // 转换提交数据为学生结果
      const studentResults = assignmentSubmissions.map((sub) => {
        let detectionResult: SubmissionDetectionResult | null = null;
        try {
          if (typeof sub.submission_detection_result === 'string') {
            detectionResult = JSON.parse(sub.submission_detection_result);
          } else {
            detectionResult = sub.submission_detection_result as unknown as SubmissionDetectionResult;
          }
        } catch (e) {
          console.error('Error parsing detection result:', e);
          return null;
        }

        if (!detectionResult) return null;

        // Determine plagiarism status based on AI probability
        let plagiarismStatus = 'cleared';
        if (detectionResult.ai_probability >= 0.8) {
          plagiarismStatus = 'confirmed';
        } else if (detectionResult.ai_probability >= 0.6) {
          plagiarismStatus = 'suspected';
        }

        // Convert AI probability to a similarity score (0-100)
        const similarityScore = Math.round(detectionResult.ai_probability * 100);

        return {
          studentId: detectionResult.student_email, // Using email as ID since it's unique
          studentName: detectionResult.student_name,
          studentEmail: detectionResult.student_email,
          score: 0, // We don't have score information in the JSON
          submissionDate: sub.submission_time || new Date(),
          plagiarismStatus: plagiarismStatus,
          similarityScore: similarityScore,
          verificationQuestions: detectionResult.verification_questions,
          canvasUrl: detectionResult.canvas_url,
          requiresVerification: detectionResult.requires_verification === 1
        };
      }).filter((result): result is NonNullable<typeof result> => result !== null);

      // 创建扩展作业对象
      const extendedAssignment = {
        id: assignment.id.toString(),
        title: assignment.assignment_name || '',
        type: 'assignment',
        dueDate: assignment.due_date || new Date(),
        totalPoints: 100,
        studentResults: studentResults
      };

      // 添加作业到课程中
      const course = courseMap.get(courseCode);
      if (course) {
        course.assignments.push(extendedAssignment);
      }
    });

    // 更新每个课程的统计信息
    for (const course of Array.from(courseMap.values())) {
      // 收集所有独特的学生
      const uniqueStudents = new Set<string>();
      let totalRiskStudents = 0;

      course.assignments.forEach((assignment) => {
        assignment.studentResults.forEach((result) => {
          uniqueStudents.add(result.studentEmail); // Using email as unique identifier
          if (result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed') {
            totalRiskStudents++;
          }
        });
      });

      // 更新课程统计信息
      course.studentCount = uniqueStudents.size;
      course.highRiskCount = totalRiskStudents;
      // Remove grade calculation since we don't have actual grades
      course.averageGrade = undefined;

      // 创建学生列表
      course.students = Array.from(uniqueStudents).map(studentEmail => {
        const studentResults = course.assignments
          .flatMap(a => a.studentResults)
          .filter(r => r.studentEmail === studentEmail);
        
        const latestResult = studentResults[studentResults.length - 1];
        
        return {
          id: studentEmail,
          name: latestResult?.studentName || 'Unknown Student',
          email: studentEmail,
          status: latestResult?.requiresVerification ? 'requires_verification' : 'active',
          riskLevel: studentResults.some(r => r.plagiarismStatus === 'confirmed') ? 'high' :
                    studentResults.some(r => r.plagiarismStatus === 'suspected') ? 'medium' : 'low'
        };
      });
    }

    const transformedCourses = Array.from(courseMap.values());
    return res.json(transformedCourses);
  } catch (error) {
    console.error('Error fetching and transforming cloud data:', error);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
} 