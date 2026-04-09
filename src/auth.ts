import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { userAuthSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 15 * 60 }, // 15 minutes session as requested
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Validate inputs using Zod
        const parsedCredentials = userAuthSchema.safeParse(credentials);
        
        if (!parsedCredentials.success) {
          return null; // Invalid data format
        }

        const { email, password } = parsedCredentials.data;

        // 2. Find user in the database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null; // User not found
        }

        // 3. Compare passwords
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordsMatch) {
          // Return user object without sensitive data
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        }

        return null; // Passwords do not match
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
});