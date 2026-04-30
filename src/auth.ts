import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials!");
        }
        
        await connectDb();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error("User does not exist");
        }
        
        const isMatch = await bcrypt.compare(credentials.password as string, user.password);
        
        if (!isMatch) {
          throw new Error("Invalid password");
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDb();
          let dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              role: "user", // default role
            });
          }
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // If we have a user (sign in), add their info to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      
      // Handle session updates (e.g. role change)
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      // We ONLY hit the DB if we are NOT in the edge runtime (middleware)
      // Next.js sets an environment variable for the runtime
      if (process.env.NEXT_RUNTIME !== 'edge' && !user && token.email) {
        try {
          await connectDb();
          const dbUser = await User.findOne({ email: token.email }).select("role name");
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error("JWT background sync error:", error);
        }
      }
      
      return token;
    },
  },
});
