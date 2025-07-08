'use client';

import { useState } from 'react';
import SimpleFundabilityCalculator from '@/components/SimpleFundabilityCalculator';

export default function CalculatorPage() {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🆓 Free Business 
            <span className="text-blue-600"> Fundability</span> Calculator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your business funding readiness in just 2 minutes. 
            Get your free fundability score and personalized recommendations to improve your chances of getting approved for business funding.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setShowCalculator(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🚀 Start Free Assessment
            </button>
            <button className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-blue-300 transition-colors">
              📊 View Sample Report
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Complete assessment in under 2 minutes with just 10 simple questions.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">Get your fundability score and personalized recommendations immediately.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">100% Free</h3>
              <p className="text-gray-600">No credit card required. No hidden fees. Completely free forever.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <SimpleFundabilityCalculator
          onClose={() => setShowCalculator(false)}
          isTrialMode={true}
        />
      )}
    </div>
  );
}
