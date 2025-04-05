import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // First, let's check what tables exist
    const tables = await prisma.$queryRaw`
      SHOW TABLES;
    `;
    console.log('Available tables:', tables);

    // Then try to find admin users in any user-related table
    const users = await prisma.$queryRaw`
      SELECT * FROM users;
    `;
    console.log('Users found:', users);
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 