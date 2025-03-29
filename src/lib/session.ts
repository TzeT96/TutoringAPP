import prisma from './prisma';

export async function createSession(code: string, userId: string) {
  return await prisma.tutoringSession.create({
    data: {
      code,
      userId,
      status: 'PENDING'
    }
  });
}

export async function updateSession(sessionId: string, status: string) {
  return await prisma.tutoringSession.update({
    where: { id: sessionId },
    data: {
      status,
      startedAt: new Date()
    }
  });
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  videoUrl?: string,
  textAnswer?: string
) {
  return await prisma.answer.create({
    data: {
      sessionId,
      questionId,
      videoUrl,
      textAnswer
    }
  });
} 