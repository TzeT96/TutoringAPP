import { PrismaClient, Prisma } from '@prisma/client';
import { ExtendedCourse, ExtendedAssignment, StudentResult } from './admin-data-service';

const prisma = new PrismaClient();

type PrismaSubmission = Prisma.SubmissionDetailGetPayload<{}>;
type PrismaAssignment = Prisma.AssignmentGeneralInfoGetPayload<{}>;

interface CloudSubmission {
  id: number;
  submission_detection_result: any;
  submission_time: Date;
  assignment_id: number;
}

interface CloudAssignment {
  id: number;
  assignment_type: string;
  assignment_name: string;
  due_date: Date;
  school: string;
  course_code: string;
  assignment_url: string;
}

export async function fetchAndTransformCloudData(): Promise<ExtendedCourse[]> {
  try {
    // 获取所有提交记录和作业信息
    console.log('Fetching data from cloud database...');
    const submissions = await prisma.submissionDetail.findMany();
    const assignments = await prisma.assignmentGeneralInfo.findMany();
    
    console.log(`Found ${submissions.length} submissions and ${assignments.length} assignments`);
    
    if (submissions.length === 0 || assignments.length === 0) {
      console.log('No data found in the database');
      return [];
    }

    // 记录第一条提交的数据结构
    if (submissions.length > 0) {
      console.log('Sample submission data:', {
        id: submissions[0].id,
        submission_time: submissions[0].submission_time,
        detection_result_type: typeof submissions[0].submission_detection_result,
        detection_result: submissions[0].submission_detection_result
      });
    }

    // 记录第一个作业的数据结构
    if (assignments.length > 0) {
      console.log('Sample assignment data:', {
        id: assignments[0].id,
        name: assignments[0].assignment_name,
        type: assignments[0].assignment_type,
        course: assignments[0].course_code
      });
    }

    // 按课程代码组织数据
    const courseMap = new Map<string, ExtendedCourse>();

    assignments.forEach((assignment) => {
      const courseCode = assignment.course_code || '';
      console.log(`Processing assignment for course: ${courseCode}`);
      
      // 如果这个课程还没有被处理过，创建新的课程对象
      if (!courseMap.has(courseCode)) {
        courseMap.set(courseCode, {
          id: courseCode,
          code: courseCode,
          name: courseCode,
          semester: 'Current', // 可以后续添加学期信息
          studentCount: 0, // 将在处理提交时更新
          assignments: [],
          students: [], // 将在处理提交时更新
          teacherId: 'default-teacher', // 可以后续添加教师信息
          highRiskCount: 0, // 将在处理提交时更新
          averageGrade: 0 // 将在处理提交时更新
        });
      }

      // 找到这个作业相关的所有提交
      const assignmentSubmissions = submissions.filter(
        (sub) => sub.assignment_id === assignment.id
      );
      
      console.log(`Found ${assignmentSubmissions.length} submissions for assignment ${assignment.assignment_name}`);

      // 转换提交数据为学生结果
      const studentResults: StudentResult[] = assignmentSubmissions.map((sub) => {
        let detectionResult: any = {};
        try {
          if (typeof sub.submission_detection_result === 'string') {
            detectionResult = JSON.parse(sub.submission_detection_result);
          } else {
            detectionResult = sub.submission_detection_result;
          }
          console.log('Successfully parsed detection result:', detectionResult);
        } catch (e) {
          console.error('Error parsing detection result:', e);
        }

        const result = {
          studentId: detectionResult.student_id?.toString() || 'unknown',
          studentName: detectionResult.student_name || 'Unknown Student',
          studentEmail: detectionResult.student_email || 'no-email',
          score: detectionResult.score || 0,
          submissionDate: sub.submission_time || new Date(),
          plagiarismStatus: detectionResult.status || 'unknown',
          similarityScore: detectionResult.similarity_score || 0
        };
        
        console.log('Transformed student result:', result);
        return result;
      });

      // 创建扩展作业对象
      const extendedAssignment: ExtendedAssignment = {
        id: assignment.id.toString(),
        title: assignment.assignment_name || '',
        type: (assignment.assignment_type || 'unknown').toLowerCase(),
        dueDate: assignment.due_date || new Date(),
        totalPoints: 100, // 默认值，可以后续修改
        studentResults: studentResults
      };
      
      console.log('Created extended assignment:', {
        id: extendedAssignment.id,
        title: extendedAssignment.title,
        type: extendedAssignment.type,
        studentCount: extendedAssignment.studentResults.length
      });

      // 添加作业到课程中
      const course = courseMap.get(courseCode);
      if (course) {
        course.assignments.push(extendedAssignment);
      }
    });

    console.log(`Processed ${courseMap.size} courses`);

    // 更新每个课程的统计信息
    for (const course of Array.from(courseMap.values())) {
      // 收集所有独特的学生
      const uniqueStudents = new Set<string>();
      let totalRiskStudents = 0;
      let totalScore = 0;
      let totalPossibleScore = 0;

      course.assignments.forEach((assignment: ExtendedAssignment) => {
        assignment.studentResults.forEach((result: StudentResult) => {
          uniqueStudents.add(result.studentId);
          if (result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed') {
            totalRiskStudents++;
          }
          totalScore += result.score;
          totalPossibleScore += 100;
        });
      });

      // 更新课程统计信息
      course.studentCount = uniqueStudents.size;
      course.highRiskCount = totalRiskStudents;
      course.averageGrade = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

      console.log('Course statistics:', {
        code: course.code,
        studentCount: course.studentCount,
        highRiskCount: course.highRiskCount,
        averageGrade: course.averageGrade
      });

      // 创建学生列表
      course.students = Array.from(uniqueStudents).map(studentId => {
        const studentResults = course.assignments
          .flatMap((a: ExtendedAssignment) => a.studentResults)
          .filter((r: StudentResult) => r.studentId === studentId);
        
        const latestResult = studentResults[studentResults.length - 1];
        
        return {
          id: studentId,
          name: latestResult?.studentName || 'Unknown Student',
          email: latestResult?.studentEmail || 'no-email',
          status: 'active',
          riskLevel: studentResults.some(r => r.plagiarismStatus === 'confirmed') ? 'high' :
                    studentResults.some(r => r.plagiarismStatus === 'suspected') ? 'medium' : 'low'
        };
      });
    }

    const transformedCourses = Array.from(courseMap.values());
    console.log('Final transformed data:', {
      courseCount: transformedCourses.length,
      totalAssignments: transformedCourses.reduce((sum, course) => sum + course.assignments.length, 0),
      totalStudents: transformedCourses.reduce((sum, course) => sum + course.studentCount, 0)
    });

    return transformedCourses;
  } catch (error) {
    console.error('Error fetching and transforming cloud data:', error);
    throw error;
  }
} 