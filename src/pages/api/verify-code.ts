import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { findVerificationCode, markVerificationCodeAsUsed, updateSessionStatus } from '@/lib/prisma-fix';

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
    
    // Use the safe helper function instead of direct Prisma query
    const verificationCode = await findVerificationCode(code, true, true);
    
    console.log('Found verification code:', verificationCode ? verificationCode.id : 'none');

    if (!verificationCode || !verificationCode.session) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const session = verificationCode.session;
    console.log('Found session:', session.id);

    // Check if session is already completed
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'This session has been completed' });
    }

    // Get questions for the session
    const questions = await prisma.question.findMany({
      where: { 
        sessionId: session.id,
        answer: null // Only get unanswered questions
      }
    });
    
    console.log('Found questions:', questions.length);

    // Update the verification code to mark it as used
    await markVerificationCodeAsUsed(verificationCode.id);

    // Update the session status to IN_PROGRESS if it's still PENDING
    if (session.status === 'PENDING') {
      await updateSessionStatus(session.id, 'IN_PROGRESS');
    }

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