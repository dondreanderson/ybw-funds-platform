import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, TrendingUp, Shield, Users } from 'lucide-react';
import AdvancedFundabilityCalculator from '@/components/AdvancedFundabilityCalculator';

export const metadata: Metadata = {
  title: 'Business Fundability Dashboard | Calculate Your Funding Score',
  description: 'Professional business fundability calculator to assess your funding readiness and get personalized recommendations for improving your business credit profile.',
  keywords: 'business funding, fundability score, business credit, loan calculator, funding assessment',
};

// Loading component for the calculator
const CalculatorSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="mt-8 h-12 bg-gray-200 rounded"></div>
  </div>
);

// Header component
const Header = () => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FundabilityPro</h1>
            <p className="text-xs text-gray-500">Business Funding Assessment</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/dashboard" 
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/reports" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Reports
          </Link>
          <Link 
            href="/resources" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Resources
          </Link>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </header>
);

// Hero section component
const HeroSection = () => (
  <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Calculate Your Business
          <span className="text-blue-600 block">Fundability Score</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Get an instant assessment of your business funding readiness with our advanced calculator. 
          Discover opportunities to improve your credit profile and access better funding options.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Analysis</h3>
            <p className="text-gray-600 text-center">Get your fundability score in minutes with our comprehensive assessment tool.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-center">Your business information is protected with enterprise-grade security.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Insights</h3>
            <p className="text-gray-600 text-center">Receive personalized recommendations from funding experts.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Main calculator section
const CalculatorSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Advanced Fundability Calculator
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Answer a few questions about your business to get a comprehensive fundability assessment 
          and personalized recommendations for improvement.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<CalculatorSkeleton />}>
          <AdvancedFundabilityCalculator />
        </Suspense>
      </div>
    </div>
  </section>
);

// Footer component
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">FundabilityPro</h3>
              <p className="text-gray-400 text-sm">Business Funding Assessment</p>
            </div>
          </div>
          <p className="text-gray-400 mb-4 max-w-md">
            Empowering businesses with intelligent funding assessments and personalized 
            recommendations to improve their fundability scores.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Calculator</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Reports</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center">
        <p className="text-gray-400">
          © 2024 FundabilityPro. All rights reserved. Built with Next.js and Tailwind CSS.
        </p>
      </div>
    </div>
  </footer>
);

// Main Dashboard Page Component
export default function DashboardPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CalculatorSection />
      </main>
      <Footer />
    </div>
  );
}
// Export the page component for Next.js App Router