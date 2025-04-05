import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '@/data/mockData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      return res.status(200).json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      
      // Mock update - in a real app, you'd update the database
      const updatedSession = mockSessions.find(s => s.id === id);
      if (!updatedSession) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Return mock updated session
      return res.status(200).json({
        ...updatedSession,
        status: status || updatedSession.status
      });
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // For demo purposes, we'll just pretend to delete
      return res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 