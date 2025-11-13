
import NextAuth from 'next-auth';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import type { User } from '@prisma/client';
import type { NextAuthConfig } from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: "Phone", type: "tel", placeholder: "+255..." },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request): Promise<any> {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone as string
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return user;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.phone = (user as User).phone;
        token.businessId = (user as User).businessId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.phone = token.phone as string;
        session.user.businessId = token.businessId as string;
      }
      return session;
    }
  }
} satisfies NextAuthConfig);
