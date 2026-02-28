import type { NextAuthConfig } from 'next-auth'

// Config légère compatible Edge runtime (middleware)
// Pas de bcrypt, pas de Supabase ici
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
}
