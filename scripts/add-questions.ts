import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the most recently created session
  const session = await prisma.tutoringSession.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { verificationCodes: true }
  });

  if (!session) {
    console.log('No session found!');
    return;
  }

  console.log('Found session:', session.id, 'with code:', session.code);

  // Get the verification code for this session
  const verificationCode = session.verificationCodes[0];
  
  if (!verificationCode) {
    console.log('No verification code found for this session!');
    return;
  }

  // Add a question for the session
  const question1 = await prisma.question.create({
    data: {
      text: 'How do I solve this force diagram?',
      sessionId: session.id,
      verificationCodeId: verificationCode.id
    }
  });

  const question2 = await prisma.question.create({
    data: {
      text: 'Can you explain Newton\'s First Law?',
      sessionId: session.id,
      verificationCodeId: verificationCode.id
    }
  });

  console.log('Created questions:', question1.id, question2.id);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect()); 