import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ownerEmail = "mukhtadanasution@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    jwt({ token }) {
      const email = token.email?.toLowerCase();
      token.role = email === ownerEmail ? "owner" : "visitor";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "visitor";
      }
      return session;
    },
  },
});
