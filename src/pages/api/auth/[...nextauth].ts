import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        // Hard-coded admin credentials for both development and production
        // Admin: admin@example.com / admin123
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          return {
            id: 'admin-id',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
          };
        }
        
        // Student: student@example.com / student123
        if (credentials.email === 'student@example.com' && credentials.password === 'student123') {
          return {
            id: 'student-id',
            email: 'student@example.com',
            name: 'Student User',
            role: 'student',
          };
        }

        // If no hardcoded credentials match, return null
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions); 