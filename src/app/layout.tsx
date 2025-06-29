import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YBW Funds - Business Credit & Funding Platform',
  description: 'Enhance your business fundability with real-time credit insights and funding access.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
      
        
          {children}
          
        
      

    
  )
}