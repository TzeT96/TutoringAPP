import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Delete in order to respect foreign key constraints
    console.log('Cleaning up database...');
    
    // Delete answers first as they depend on questions and sessions
    await prisma.answer.deleteMany();
    console.log('✓ Answers deleted');
    
    // Delete questions as they depend on verification codes and sessions
    await prisma.question.deleteMany();
    console.log('✓ Questions deleted');
    
    // Delete verification codes as they depend on sessions
    await prisma.verificationCode.deleteMany();
    console.log('✓ Verification codes deleted');
    
    // Delete tutoring sessions
    await prisma.tutoringSession.deleteMany();
    console.log('✓ Tutoring sessions deleted');
    
    // Delete auth sessions
    await prisma.authSession.deleteMany();
    console.log('✓ Auth sessions deleted');
    
    // Delete verification tokens
    await prisma.verificationToken.deleteMany();
    console.log('✓ Verification tokens deleted');
    
    // Keep users table intact for login purposes
    console.log('✓ Cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 