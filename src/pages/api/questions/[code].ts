import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { findVerificationCode } from '@/lib/prisma-fix';

interface QuestionResponse {
  id: string;
  text: string;
  answer: {
    id: string;
    videoUrl?: string;
    textAnswer?: string;
  } | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    console.log('Searching for verification code:', code);
    
    // Use the safe helper function to find the verification code
    const verificationCode = await findVerificationCode(code, true, true);

    if (!verificationCode || !verificationCode.session) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    const session = verificationCode.session;
    console.log('Found session:', session.id);

    // Check if the session is completed
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ message: 'This session has been completed' });
    }

    // Get questions for this session
    const questions = await prisma.question.findMany({
      where: {
        sessionId: session.id
      },
      include: {
        answer: true
      }
    });

    console.log('Found questions:', questions.length);

    const formattedQuestions: QuestionResponse[] = questions.map(q => ({
      id: q.id,
      text: q.text,
      answer: q.answer ? {
        id: q.answer.id,
        videoUrl: q.answer.videoUrl || undefined,
        textAnswer: q.answer.textAnswer || undefined
      } : null
    }));

    // Find the first unanswered question index
    const currentQuestionIndex = formattedQuestions.findIndex(q => !q.answer);
    
    return res.status(200).json({ 
      questions: formattedQuestions,
      currentQuestionIndex: currentQuestionIndex === -1 ? formattedQuestions.length - 1 : currentQuestionIndex,
      isComplete: currentQuestionIndex === -1 && formattedQuestions.length > 0
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 