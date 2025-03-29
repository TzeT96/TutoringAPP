import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Create a dummy session token for testing
  const sessionToken = randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days from now

  const user = await prisma.user.findFirst({
    where: { email: 'admin@example.com' }
  });

  if (user) {
    // Create a session for this user
    const session = await prisma.authSession.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });

    console.log('Created session:', session);
    console.log('Session cookie value (for next.js.session-token):', sessionToken);
  } else {
    console.log('Admin user not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect()); 