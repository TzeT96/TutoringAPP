import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { findVerificationCode } from '@/lib/prisma-fix';

// Allow regular JSON body parsing
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Processing answer submission...');
    
    // Get data from request body
    const { questionId, code, textAnswer } = req.body;

    console.log('Submission data:', { questionId, code, textAnswer });

    if (!questionId || !code) {
      console.error('Missing required fields:', { questionId, code });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Looking up verification code:', code);
    
    // Find the verification code using our safe helper function
    // We don't need to enforce the active check here
    const verificationCode = await findVerificationCode(code, true, false);

    if (!verificationCode || !verificationCode.session) {
      return res.status(404).json({ error: 'Invalid verification code' });
    }

    const session = verificationCode.session;
    console.log('Found session:', session.id);

    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'This session has been completed' });
    }

    // Find the question
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        sessionId: session.id
      },
      include: {
        answer: true
      }
    });

    if (!question) {
      console.error('Question not found:', questionId);
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if the question already has an answer
    if (question.answer) {
      return res.status(400).json({ error: 'This question has already been answered' });
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        textAnswer: textAnswer || null,
        sessionId: session.id,
        questionId: question.id
      }
    });

    console.log('Answer created successfully:', answer.id);

    return res.status(200).json({ 
      message: 'Answer submitted successfully',
      answer: {
        id: answer.id,
        questionId: answer.questionId,
        sessionId: answer.sessionId,
        videoUrl: answer.videoUrl,
        textAnswer: answer.textAnswer,
        submittedAt: answer.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 