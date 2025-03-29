import type { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions } from '../../data/mockData';

function generateRandomCode(length: number = 6): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Find the session in the mock data
    const sessionIndex = mockSessions.findIndex(session => session.id === sessionId);
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const code = generateRandomCode();

    // Update the session with the new code (in-memory only)
    mockSessions[sessionIndex].verificationCode = code;

    // Return the new verification code
    return res.status(200).json({ 
      code,
      message: 'Verification code generated successfully'
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 