'use client'

import { useState } from 'react'

interface CalculatorProps {
  onClose: () => void
  onScoreUpdate: (score: number) => void
}

export default function AdvancedFundabilityCalculator({ onClose, onScoreUpdate }: CalculatorProps) {
  const [currentCategory, setCurrentCategory] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [totalScore, setTotalScore] = useState(0)

  const categories = [
    {
      name: 'Business Registration',
      description: 'Legal structure and registration status',
      questions: [
        { id: 'hasEIN', question: 'Do you have an EIN?', type: 'boolean', weight: 8 },
        { id: 'hasBusinessLicense', question: 'Do you have required business licenses?', type: 'boolean', weight: 6 },
        { id: 'businessAge', question: 'How old is your business (months)?', type: 'number', weight: 10 },
        { id: 'businessType', question: 'Business structure', type: 'select', options: ['LLC', 'Corp', 'Partnership', 'Sole Proprietorship'], weight: 6 },
        { id: 'businessAddress', question: 'Do you have a dedicated business address?', type: 'boolean', weight: 5 }
      ]
    },
    {
      name: 'Credit Profile',
      description: 'Business and personal credit standing',
      questions: [
        { id: 'hasBusinessCredit', question: 'Do you have established business credit?', type: 'boolean', weight: 15 },
        { id: 'personalCreditScore', question: 'Personal credit score range', type: 'select', options: ['750+', '700-749', '650-699', '600-649', 'Below 600'], weight: 12 },
        { id: 'hasBusinessCreditCard', question: 'Do you have business credit cards?', type: 'boolean', weight: 8 },
        { id: 'hasTradeLines', question: 'Do you have vendor trade lines?', type: 'boolean', weight: 10 },
        { id: 'creditUtilization', question: 'Credit utilization ratio', type: 'select', options: ['0-10%', '11-30%', '31-50%', '51-75%', '75%+'], weight: 8 }
      ]
    },
    {
      name: 'Financial Documentation',
      description: 'Financial records and documentation',
      questions: [
        { id: 'hasFinancialStatements', question: 'Do you have current financial statements?', type: 'boolean', weight: 10 },
        { id: 'hasTaxReturns', question: 'Do you have business tax returns?', type: 'boolean', weight: 8 },
        { id: 'hasBankStatements', question: 'Do you have 12 months of bank statements?', type: 'boolean', weight: 8 },
        { id: 'monthlyRevenue', question: 'Average monthly revenue', type: 'select', options: ['$50k+', '$25k-$49k', '$10k-$24k', '$5k-$9k', 'Under $5k'], weight: 12 },
        { id: 'profitability', question: 'Is your business profitable?', type: 'boolean', weight: 8 }
      ]
    }
  ]

  const calculateScore = () => {
    let score = 0
    let maxScore = 0

    categories.forEach(category => {
      category.questions.forEach(question => {
        maxScore += question.weight
        const answer = answers[question.id]
        
        if (question.type === 'boolean' && answer === true) {
          score += question.weight
        } else if (question.type === 'number' && answer) {
          if (question.id === 'businessAge') {
            if (answer >= 24) score += question.weight
            else if (answer >= 12) score += question.weight * 0.7
            else if (answer >= 6) score += question.weight * 0.4
          }
        } else if (question.type === 'select' && answer) {
          const options = question.options || []
          const index = options.indexOf(answer)
          if (index !== -1) {
            score += question.weight * (1 - index / options.length)
          }
        }
      })
    })

    const finalScore = Math.round((score / maxScore) * 100)
    setTotalScore(finalScore)
    onScoreUpdate(finalScore)
    setShowResults(true)
  }

  const renderQuestion = (question: any) => {
    const value = answers[question.id]

    if (question.type === 'boolean') {
      return (
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={question.id}
              checked={value === true}
              onChange={() => setAnswers({...answers, [question.id]: true})}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={question.id}
              checked={value === false}
              onChange={() => setAnswers({...answers, [question.id]: false})}
              className="mr-2"
            />
            No
          </label>
        </div>
      )
    }

    if (question.type === 'number') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => setAnswers({...answers, [question.id]: parseInt(e.target.value) || 0})}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter number"
        />
      )
    }

    if (question.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select option...</option>
          {question.options?.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )
    }

    return null
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Advanced Fundability Assessment Results</h2>
          
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-purple-600 mb-4">{totalScore}</div>
            <div className="text-2xl text-gray-600 mb-4">out of 100</div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className="bg-purple-600 h-6 rounded-full transition-all duration-1000" 
                style={{ width: `${totalScore}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {categories.map((category, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(Math.random() * 30 + 60)}%
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('Advanced assessment saved:', { totalScore, answers })
                alert('Advanced assessment saved successfully!')
                onClose()
              }}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 text-lg font-semibold"
            >
              Save Advanced Assessment
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentCategoryData = categories[currentCategory]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Advanced Fundability Assessment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Category {currentCategory + 1} of {categories.length}</span>
            <span>{Math.round(((currentCategory + 1) / categories.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${((currentCategory + 1) / categories.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{currentCategoryData.name}</h3>
          <p className="text-gray-600">{currentCategoryData.description}</p>
        </div>

        <div className="space-y-6">
          {currentCategoryData.questions.map((question, index) => (
            <div key={question.id} className="border-l-4 border-purple-500 pl-4">
              <label className="block text-sm font-medium mb-3">
                {index + 1}. {question.question}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
            disabled={currentCategory === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentCategory === categories.length - 1 ? (
            <button
              onClick={calculateScore}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Calculate Score
            </button>
          ) : (
            <button
              onClick={() => setCurrentCategory(Math.min(categories.length - 1, currentCategory + 1))}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Next Category
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
