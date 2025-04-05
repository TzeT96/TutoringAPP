import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '../../../data/mockData';

// Create a mock students array from the session data
const mockStudents = mockSessions.flatMap(session => 
  session.students.map(student => ({
    ...student,
    sessionId: session.id,
    courseId: session.courseId
  }))
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Skip auth check for demo
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId } = req.query;

    // Filter students by course ID if provided
    let studentsData = [...mockStudents];
    
    if (courseId) {
      // Filter students who belong to this course
      studentsData = mockStudents.filter(student => 
        student.courseId === courseId
      );
    }

    // Transform the data for the frontend
    const transformedStudents = studentsData.map(student => {
      // Find sessions for this student
      const studentSessions = mockSessions.filter(session => 
        session.students.some(s => s.id === student.id)
      );
      const completedSessions = studentSessions.filter(session => session.status === 'completed');
      
      return {
        id: student.id,
        name: student.name,
        email: student.email || `${student.id}@example.com`,
        grade: calculateGrade(studentSessions),
        riskLevel: determineRiskLevel(studentSessions),
        emailStatus: student.emailStatus || 'sent',
        cheatingStatus: student.plagiarismStatus === 'suspected' ? 'pending' : 
                        student.plagiarismStatus === 'confirmed' ? 'confirmed' : 'false_positive',
        sessions: studentSessions.length,
        completedSessions: completedSessions.length
      };
    });

    return res.status(200).json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { studentIds, action } = req.body;

    switch (action) {
      case 'sendEmail':
        // Mock email sending logic
        return res.status(200).json({ message: 'Emails sent successfully' });
      
      case 'downloadReport':
        // Mock report generation logic
        return res.status(200).json({ message: 'Report generated successfully' });
      
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error processing student action:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { studentId, status } = req.body;

    // Mock status update logic
    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating student status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper functions
function calculateGrade(sessions: any[]): number {
  // Return a random grade between 70 and 95
  return Math.floor(Math.random() * 25) + 70;
}

function determineRiskLevel(sessions: any[]): 'low' | 'medium' | 'high' {
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  
  if (total === 0) return 'low';
  
  const completionRate = completed / total;
  
  if (completionRate > 0.8) return 'low';
  if (completionRate > 0.4) return 'medium';
  return 'high';
} 