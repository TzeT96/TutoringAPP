import { NextApiRequest, NextApiResponse } from 'next';
import { mockData } from '@/data/mockData';

export default async function verifyCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    console.log('Searching for verification code:', code);
    
    // Find session with matching verification code
    const session = mockData.sessions.find(s => 
      s.verificationCode && s.verificationCode.toUpperCase() === code.toUpperCase()
    );

    if (!session) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    console.log('Found session:', session.id);

    // Check if session is already completed
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'This session has been completed' });
    }

    // Get questions for the session
    const questions = mockData.questions.filter(q => 
      q.sessionId === session.id && !q.answered
    );
    
    console.log('Found questions:', questions.length);

    // Return session and questions
    return res.status(200).json({ 
      sessionId: session.id,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text
      }))
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 