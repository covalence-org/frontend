import NextAuth, { type User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createWithBaseURL } from "@/lib/utils"
// Your own logic for dealing with plaintext password strings; be careful!
 
declare module "next-auth" {
  interface User {
    aud: string
    role: string
    created_at: string
    updated_at: string
    email_confirmed_at?: string
    phone?: string
  }
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        // Add your own authentication logic here
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            // Return a user object that matches the next-auth User type
            return {
              id: "1",
              email: credentials.email as string,
              name: "Test User",
              aud: "authenticated", // Example value
              role: "user", // Example value
              created_at: new Date().toISOString(), // Example value
              updated_at: new Date().toISOString(), // Example value
            };
          }
          
          throw new Error("Invalid credentials");
        } catch (error) {
          console.error("Authentication error:", error);
          throw error; // Rethrow the error to be handled properly
        }
      }
    }),
  ],
    callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
  },
})