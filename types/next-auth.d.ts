
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      githubUsername?: string | null
      githubProfileUrl?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    githubUsername?: string | null
    githubProfileUrl?: string | null
    role?: string
  }
}
