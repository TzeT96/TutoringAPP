import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '@/data/mockData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, questionId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (!questionId || typeof questionId !== 'string') {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  // Mock finding a session and question
  const session = mockSessions.find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // This is mock data, so we'll create a fake question
  const mockQuestion = {
    id: questionId,
    text: 'Sample question for the session',
    verificationCode: {
      code: `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    },
    answer: null
  };

  if (req.method === 'GET') {
    try {
      return res.status(200).json(mockQuestion);
    } catch (error) {
      console.error('Error fetching question:', error);
      return res.status(500).json({ error: 'Failed to fetch question' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      // Return updated question
      return res.status(200).json({
        ...mockQuestion,
        text
      });
    } catch (error) {
      console.error('Error updating question:', error);
      return res.status(500).json({ error: 'Failed to update question' });
    }
  } else if (req.method === 'DELETE') {
    try {
      return res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error);
      return res.status(500).json({ error: 'Failed to delete question' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 