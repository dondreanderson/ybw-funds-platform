import './globals.css'
import { Inter } from 'next/font/google'
import Providers from './providers'
import { AssessmentProvider } from '@/contexts/AssessmentContext'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YBW Funds Platform',
  description: 'Business Credit & Funding Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AssessmentProvider>  {/* ADD THIS */}
            {children}
          </AssessmentProvider>
        </Providers>
      </body>
    </html>
  )
}