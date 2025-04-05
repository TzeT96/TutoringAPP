import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '../../../data/mockData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Calculate statistics from mock data
    const totalStudents = mockSessions.length;
    const completedSessions = mockSessions.filter(session => session.status === 'completed').length;
    const inProgressSessions = mockSessions.filter(session => session.status === 'in-progress').length;

    // Courses stats
    const courseMap = new Map();
    mockSessions.forEach(session => {
      if (!courseMap.has(session.courseId)) {
        courseMap.set(session.courseId, {
          id: session.courseId,
          name: session.course,
          semester: 'Spring 2024',
          studentCount: 0,
          highRiskCount: 0,
          averageGrade: 85,
        });
      }
      
      const courseStats = courseMap.get(session.courseId);
      courseStats.studentCount++;
      
      if (session.status === 'in-progress') {
        courseStats.highRiskCount++;
      }
    });

    const transformedCourses = Array.from(courseMap.values());

    // Mock stats
    const stats = {
      totalStudents,
      highRiskRatio: totalStudents > 0 ? (inProgressSessions / totalStudents) * 100 : 0,
      averageGrade: 83.5,
      submissionRate: (completedSessions / totalStudents) * 100,
    };

    return res.status(200).json({
      courses: transformedCourses,
      stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 