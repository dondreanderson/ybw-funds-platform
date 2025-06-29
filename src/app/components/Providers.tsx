'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session?: any
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  )
}
