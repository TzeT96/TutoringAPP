import prisma from './prisma';

export async function createSession(codeId: number) {
  return await prisma.session.create({
    data: {
      codeId,
    }
  });
}

export async function updateSession(sessionId: number, videoUrl: string) {
  return await prisma.session.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      videoUrl
    }
  });
}

export async function submitAnswer(
  sessionId: number,
  questionId: number,
  videoUrl: string
) {
  return await prisma.answer.create({
    data: {
      sessionId,
      questionId,
      videoUrl
    }
  });
} 