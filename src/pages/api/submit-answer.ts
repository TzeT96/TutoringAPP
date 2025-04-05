import { NextApiRequest, NextApiResponse } from 'next';
import { mockSessions, mockQuestions, MockSession, MockQuestion } from '@/lib/mock-data';

// Allow regular JSON body parsing
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { questionId, code, textAnswer } = req.body;
    console.log('Processing answer submission...');
    console.log('Submission data:', { questionId, code, textAnswer });

    // Find the session using the verification code from mock data
    const session = mockSessions.find((s: MockSession) => s.code === code);
    if (!session) {
      return res.status(404).json({ error: 'Invalid verification code' });
    }

    // Find the question in mock data
    const question = mockQuestions.find((q: MockQuestion) => q.id === questionId && q.sessionId === session.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update the question with the answer
    const answer = {
      id: `answer-${Date.now()}`,
      videoUrl: '', // We'll handle video upload separately if needed
      textAnswer: textAnswer
    };
    question.answer = answer;
    question.answered = true;

    // Check if all questions in the session are answered
    const allQuestionsAnswered = mockQuestions
      .filter((q: MockQuestion) => q.sessionId === session.id)
      .every((q: MockQuestion) => q.answered);

    if (allQuestionsAnswered) {
      session.status = 'completed';
    }

    return res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      sessionStatus: session.status,
      answer: {
        id: answer.id,
        videoUrl: answer.videoUrl,
        textAnswer: answer.textAnswer,
        sessionId: session.id,
        questionId: question.id
      }
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ 
      error: 'Failed to submit answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 