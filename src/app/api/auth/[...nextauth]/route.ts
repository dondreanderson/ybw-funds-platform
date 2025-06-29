import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Demo credentials for now
        const demoUsers = [
          { id: '1', email: 'demo@ybwfunds.com', password: 'demo123', name: 'Demo User' },
          { id: '2', email: 'admin@ybwfunds.com', password: 'admin123', name: 'Admin User' },
          { id: '3', email: 'business@ybwfunds.com', password: 'business123', name: 'Business User' }
        ]

        const user = demoUsers.find(
          u => u.email === credentials?.email && u.password === credentials?.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }