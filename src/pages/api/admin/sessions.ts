import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use a default user ID since we're not using authentication
  const userId = 'admin-user';
  
  if (req.method === 'GET') {
    try {
      const { code } = req.query;
      
      if (code && typeof code === 'string') {
        // Find a specific session by ID
        const tutorSession = await prisma.tutoringSession.findUnique({
          where: { id: code },
          include: {
            verificationCodes: true,
            questions: {
              include: {
                answer: true
              }
            }
          }
        });

        if (!tutorSession) {
          return res.status(404).json({ error: 'Session not found' });
        }

        return res.status(200).json(tutorSession);
      }

      // Return all sessions for this user
      const sessions = await prisma.tutoringSession.findMany({
        include: {
          verificationCodes: true,
          questions: {
            include: {
              answer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create a new verification code
      const generatedCode = randomBytes(3).toString('hex').toUpperCase();
      
      // Create a new session with its verification code
      const newSession = await prisma.tutoringSession.create({
        data: {
          code: (req.body.code || generatedCode).toUpperCase(),
          status: 'PENDING',
          userId,
          verificationCodes: {
            create: {
              code: generatedCode,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
            }
          }
        },
        include: {
          verificationCodes: true
        }
      });

      return res.status(201).json(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, code, status } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Check if user owns the session
      const existingSession = await prisma.tutoringSession.findUnique({
        where: { id }
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (existingSession.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this session' });
      }

      // Update the session
      const updatedSession = await prisma.tutoringSession.update({
        where: { id },
        data: {
          code: code || existingSession.code,
          status: status || existingSession.status
        }
      });

      return res.status(200).json(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Check if user owns the session
      const existingSession = await prisma.tutoringSession.findUnique({
        where: { id }
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (existingSession.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this session' });
      }

      // Delete all related entities first
      await prisma.$transaction([
        // Delete answers to questions in this session
        prisma.answer.deleteMany({
          where: {
            question: {
              sessionId: id
            }
          }
        }),
        // Delete questions in this session
        prisma.question.deleteMany({
          where: { sessionId: id }
        }),
        // Delete verification code for this session
        prisma.verificationCode.deleteMany({
          where: { sessionId: id }
        }),
        // Finally delete the session
        prisma.tutoringSession.delete({
          where: { id }
        })
      ]);

      return res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 