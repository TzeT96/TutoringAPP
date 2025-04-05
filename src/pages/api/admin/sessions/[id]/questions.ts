import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Find session in mock data
  const sessionIndex = mockSessions.findIndex(s => s.id === id);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (req.method === 'GET') {
    try {
      const session = mockSessions[sessionIndex];
      const questions = session.plagiarismCase?.studentQuestions || [];
      return res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      // Create a new question with a random ID
      const newQuestion = {
        id: uuidv4(),
        text,
        verificationCode: {
          code: `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        },
        answer: null
      };

      // Return mock created question
      return res.status(201).json(newQuestion);
    } catch (error) {
      console.error('Error creating question:', error);
      return res.status(500).json({ error: 'Failed to create question' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 