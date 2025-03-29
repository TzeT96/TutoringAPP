import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '@/data/mockData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For demo, we'll skip authentication
  
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Find session in mock data
      const session = mockSessions.find(s => s.id === id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // If session has a plagiarismCase with studentQuestions
      if (session.plagiarismCase && session.plagiarismCase.studentQuestions) {
        const allQuestions = session.plagiarismCase.studentQuestions.flatMap(sq => 
          sq.questions.map((q, index) => ({
            id: `question-${index}`,
            text: q,
            studentId: sq.studentId,
            studentName: sq.studentName,
            answered: Math.random() > 0.5
          }))
        );
        
        return res.status(200).json(allQuestions);
      }

      // Return empty array if no questions
      return res.status(200).json([]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else if (req.method === 'POST') {
    try {
      // This would normally create a new question
      // For demo, we'll just return success
      return res.status(201).json({ message: 'Question created successfully', id: 'new-question-id' });
    } catch (error) {
      console.error('Error creating question:', error);
      return res.status(500).json({ error: 'Failed to create question' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 