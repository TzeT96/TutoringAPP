import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '../../data/mockData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, code } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Find the session
    const sessionIndex = mockSessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = mockSessions[sessionIndex];
    
    // Generate a new verification code if needed
    if (!code) {
      const newCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
        
      // Update the session with the new code (in-memory only)
      mockSessions[sessionIndex].verificationCode = newCode;
      
      return res.status(200).json({ 
        message: 'Verification code reset successfully',
        code: newCode
      });
    } else {
      // If a specific code was provided, use it
      mockSessions[sessionIndex].verificationCode = code;
      
      return res.status(200).json({ 
        message: 'Verification code updated successfully',
        code: code
      });
    }
  } catch (error) {
    console.error('Error resetting code:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 