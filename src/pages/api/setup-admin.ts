import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (process.env.ADMIN_SETUP_KEY !== req.headers['x-setup-key']) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
      },
    });

    res.status(200).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
} 