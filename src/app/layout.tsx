import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YBW Funds - Business Credit & Funding Platform',
  description: 'Improve your business fundability and access credit with our comprehensive platform.',
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