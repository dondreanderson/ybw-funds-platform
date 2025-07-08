'use client'

import { SessionProvider } from 'next-auth/react'
import { AssessmentProvider } from '@/contexts/AssessmentContext'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AssessmentProvider>
        {children}
      </AssessmentProvider>
    </SessionProvider>
  )
}
        