import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('Found admin users:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log('Admin user:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      });
    });
  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers(); 