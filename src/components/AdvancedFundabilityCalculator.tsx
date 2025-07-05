'use client'

import { useState, useCallback } from 'react'

interface CalculatorProps {
  onClose: () => void
  onScoreUpdate: (score: number) => void
}

export default function AdvancedFundabilityCalculator({ onClose, onScoreUpdate }: CalculatorProps) {
  // All hooks at the top - never conditional
  const [currentCategory, setCurrentCategory] = useState(0)
  const [answers, setAnswers] = useState>({})
  const [showResults, setShowResults] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [loading, setLoading] = useState(false)

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
    },
    {
      name: 'Online Presence',
      description: 'Digital footprint and marketing presence',
      questions: [
        { id: 'hasWebsite', question: 'Do you have a professional business website?', type: 'boolean', weight: 8 },
        { id: 'hasBusinessEmail', question: 'Do you use a business email address?', type: 'boolean', weight: 6 },
        { id: 'hasSocialMedia', question: 'Do you have business social media profiles?', type: 'boolean', weight: 5 },
        { id: 'hasGoogleListing', question: 'Do you have a Google My Business listing?', type: 'boolean', weight: 7 },
        { id: 'onlineReviews', question: 'Do you have positive online reviews?', type: 'boolean', weight: 6 }
      ]
    },
    {
      name: 'Operational Infrastructure',
      description: 'Business operations and infrastructure',
      questions: [
        { id: 'hasBusinessPhone', question: 'Do you have a dedicated business phone?', type: 'boolean', weight: 6 },
        { id: 'hasBusinessInsurance', question: 'Do you have business insurance?', type: 'boolean', weight: 8 },
        { id: 'hasEmployees', question: 'Do you have employees?', type: 'boolean', weight: 5 },
        { id: 'hasAccountingSoftware', question: 'Do you use accounting software?', type: 'boolean', weight: 6 },
        { id: 'hasBusinessPlan', question: 'Do you have a written business plan?', type: 'boolean', weight: 7 }
      ]
    }
  ]

  const calculateScore = useCallback(() => {
    setLoading(true)
    
    // Simulate calculation time for better UX
    setTimeout(() => {
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
      setLoading(false)
    }, 1500)
  }, [answers, categories, onScoreUpdate])

  const saveAssessment = useCallback(async () => {
    try {
      const response = await fetch('/api/fundability/save-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalScore,
          answers,
          categoryBreakdown: getCategoryBreakdown()
        })
      })
      
      if (response.ok) {
        alert('Advanced assessment saved successfully!')
        onClose()
      } else {
        throw new Error('Failed to save assessment')
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Failed to save assessment. Please try again.')
    }
  }, [totalScore, answers, onClose])

  const getCategoryBreakdown = useCallback(() => {
    return categories.map(category => {
      let categoryScore = 0
      let categoryMaxScore = 0
      
      category.questions.forEach(question => {
        categoryMaxScore += question.weight
        const answer = answers[question.id]
        
        if (question.type === 'boolean' && answer === true) {
          categoryScore += question.weight
        } else if (question.type === 'number' && answer) {
          if (question.id === 'businessAge') {
            if (answer >= 24) categoryScore += question.weight
            else if (answer >= 12) categoryScore += question.weight * 0.7
            else if (answer >= 6) categoryScore += question.weight * 0.4
          }
        } else if (question.type === 'select' && answer) {
          const options = question.options || []
          const index = options.indexOf(answer)
          if (index !== -1) {
            categoryScore += question.weight * (1 - index / options.length)
          }
        }
      })
      
      return {
        name: category.name,
        score: Math.round((categoryScore / categoryMaxScore) * 100)
      }
    })
  }, [answers, categories])

  const renderQuestion = useCallback((question: any) => {
    const value = answers[question.id]

    if (question.type === 'boolean') {
      return (
        
          
             setAnswers(prev => ({...prev, [question.id]: true}))}
              className="mr-2 text-purple-600 focus:ring-purple-500"
            />
            Yes
          
          
             setAnswers(prev => ({...prev, [question.id]: false}))}
              className="mr-2 text-purple-600 focus:ring-purple-500"
            />
            No
          
        
      )
    }

    if (question.type === 'number') {
      return (
         setAnswers(prev => ({...prev, [question.id]: parseInt(e.target.value) || 0}))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter number"
          min="0"
        />
      )
    }

    if (question.type === 'select') {
      return (
         setAnswers(prev => ({...prev, [question.id]: e.target.value}))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          Select option...
          {question.options?.map((option: string) => (
            {option}
          ))}
        
      )
    }

    return null
  }, [answers])

  // Results Screen
  if (showResults) {
    const categoryBreakdown = getCategoryBreakdown()
    
    return (
      
        
          
            Advanced Fundability Assessment Results
          
          
          
            {totalScore}
            out of 100
            
              
            
            
              {totalScore >= 80 ? 'Excellent fundability!' : 
               totalScore >= 60 ? 'Good fundability with room for improvement' : 
               'Significant improvements needed for better fundability'}
            
          

          
            {categoryBreakdown.map((category, index) => (
              
                {category.name}
                
                  {category.score}%
                
                
                  
                
              
            ))}
          

          
            
              Save Advanced Assessment
            
            
              Close
            
          
        
      
    )
  }

  // Loading Screen
  if (loading) {
    return (
      
        
          
          Calculating Your Score
          Analyzing your responses across all categories...
        
      
    )
  }

  const currentCategoryData = categories[currentCategory]
  const progress = ((currentCategory + 1) / categories.length) * 100

  return (
    
      
        
          Advanced Fundability Assessment
          
            ×
          
        

        {/* Progress Bar */}
        
          
            Category {currentCategory + 1} of {categories.length}
            {Math.round(progress)}% Complete
          
          
            
          
        

        {/* Category Header */}
        
          {currentCategoryData.name}
          {currentCategoryData.description}
        

        {/* Questions */}
        
          {currentCategoryData.questions.map((question, index) => (
            
              
                {index + 1}. {question.question}
              
              {renderQuestion(question)}
            
          ))}
        

        {/* Navigation */}
        
           setCurrentCategory(Math.max(0, currentCategory - 1))}
            disabled={currentCategory === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          
          
          
            {currentCategory + 1} / {categories.length}
          
          
          {currentCategory === categories.length - 1 ? (
            
              Calculate Final Score
            
          ) : (
             setCurrentCategory(Math.min(categories.length - 1, currentCategory + 1))}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
            >
              Next →
            
          )}
        
      
    
  )
}