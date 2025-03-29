import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const { id, questionId } = req.query;

  if (!id || typeof id !== 'string' || !questionId || typeof questionId !== 'string') {
    return res.status(400).json({ error: 'Invalid session or question ID' });
  }

  // Verify session ownership and status
  const tutoringSession = await prisma.tutoringSession.findUnique({
    where: { id },
    include: {
      questions: {
        where: { id: questionId },
        include: { answer: true }
      }
    }
  });

  if (!tutoringSession) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (tutoringSession.userId !== user.id) {
    return res.status(403).json({ error: 'Not authorized to modify this session' });
  }

  if (tutoringSession.status !== 'PENDING') {
    return res.status(400).json({ error: 'Can only modify questions in pending sessions' });
  }

  const question = tutoringSession.questions[0];
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (question.answer) {
    return res.status(400).json({ error: 'Cannot modify questions that have been answered' });
  }

  // PUT /api/admin/sessions/[id]/questions/[questionId] - Update question
  if (req.method === 'PUT') {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Question text is required' });
    }

    try {
      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: { text },
        include: {
          verificationCode: true,
          answer: true
        }
      });

      return res.status(200).json(updatedQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
      return res.status(500).json({ error: 'Failed to update question' });
    }
  }

  // DELETE /api/admin/sessions/[id]/questions/[questionId] - Delete question
  if (req.method === 'DELETE') {
    try {
      await prisma.question.delete({
        where: { id: questionId }
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting question:', error);
      return res.status(500).json({ error: 'Failed to delete question' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 