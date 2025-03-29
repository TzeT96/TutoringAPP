import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions, mockQuestions } from '@/data/mockData';

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
    
    // Find session with matching verification code
    const session = mockSessions.find(s => 
      s.verificationCode && s.verificationCode.toUpperCase() === code.toUpperCase()
    );

    if (!session) {
      console.log('No session found with verification code:', code);
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    console.log('Found session:', session.id);

    // Check if the session is completed
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'This session has been completed' });
    }

    // Get questions for this session
    const questions = mockQuestions.filter(q => q.sessionId === session.id);
    console.log('Found questions:', questions.length);

    const formattedQuestions: QuestionResponse[] = questions.map(q => ({
      id: q.id,
      text: q.text,
      answer: q.answered ? {
        id: `answer-${q.id}`,
        textAnswer: 'Sample answer' // In a real app, this would come from the database
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