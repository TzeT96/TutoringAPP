import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateVerificationCode() {
  // Generate a 6-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

async function main() {
  try {
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Create expiration date for verification code (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Generate a verification code
    const verificationCode = generateVerificationCode();

    // Create a tutoring session
    const session = await prisma.tutoringSession.create({
      data: {
        code: `SESSION-${Date.now()}`,
        status: 'PENDING',
        userId: adminUser.id,
        verificationCodes: {
          create: {
            code: verificationCode,
            expiresAt,
            isUsed: false
          }
        }
      },
      include: {
        verificationCodes: true
      }
    });

    console.log('Created tutoring session:', {
      id: session.id,
      code: session.code,
      status: session.status
    });
    
    console.log('');
    console.log('**************************************');
    console.log(`VERIFICATION CODE: ${verificationCode}`);
    console.log('**************************************');
    console.log('Use this code for the student to access the session');
    
    // Create some sample questions
    await prisma.question.create({
      data: {
        text: 'How do you solve a force diagram in physics?',
        sessionId: session.id,
        verificationCodeId: session.verificationCodes[0].id
      }
    });
    
    await prisma.question.create({
      data: {
        text: 'Explain Newton\'s First Law of Motion',
        sessionId: session.id,
        verificationCodeId: session.verificationCodes[0].id
      }
    });
    
    console.log('Created sample questions for the session');
    
  } catch (error) {
    console.error('Error creating tutoring session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 