import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mockSessions } from '@/data/mockData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Bypass authentication for demo
  // const session = await getServerSession(req, res, authOptions);
  // if (!session) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

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
      // For demo purposes, we'll just pretend to update
      return res.status(200).json({ message: 'Session updated successfully' });
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