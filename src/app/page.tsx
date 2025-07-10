'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import AIAssessmentWidget from '@/components/ai/AIAssessmentWidget'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              YBW Funds Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-Powered Business Credit & Funding Platform with Intelligent Assessments
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/auth/signin"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🚀 Get Started
              </Link>
              <Link 
                href="/calculator"
                className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-blue-300 transition-colors"
              >
                🆓 Try Free Calculator
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Assessment"
              description="Advanced AI analyzes your business and provides personalized funding recommendations"
            />
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Track your fundability score and monitor improvements over time"
            />
            <FeatureCard
              icon="🎯"
              title="Smart Matching"
              description="Connect with the right lenders based on your business profile"
            />
          </div>

          {/* AI Demo Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Experience Our AI Assessment
              </h2>
              <p className="text-gray-600">
                Try our advanced AI assessment tool to see how it works
              </p>
            </div>
            
            <AIAssessmentWidget 
              onComplete={(result) => {
                console.log('Demo assessment completed:', result)
              }} 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">YBW Funds Platform</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
