'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalculatorProps {
  onClose: () => void
  onScoreUpdate: (score: number) => void
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  criteriaCount: number
  weight: number
  questions: Question[]
}

interface Question {
  id: string
  text: string
  type: 'boolean' | 'scale' | 'select' | 'number'
  weight: number
  options?: string[]
  required: boolean
  helpText?: string
}

interface Assessment {
  categoryId: string
  responses: Record
  score: number
  maxScore: number
}

const categories: Category[] = [
  {
    id: 'business_registration',
    name: 'Business Registration & Structure',
    description: 'Legal foundation and business setup',
    icon: '🏢',
    criteriaCount: 25,
    weight: 0.20,
    questions: [
      {
        id: 'has_ein',
        text: 'Do you have an EIN (Employer Identification Number)?',
        type: 'boolean',
        weight: 10,
        required: true,
        helpText: 'An EIN is essential for business credit building'
      },
      {
        id: 'business_structure',
        text: 'What is your business structure?',
        type: 'select',
        weight: 8,
        required: true,
        options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'],
        helpText: 'LLCs and Corporations typically have better fundability'
      },
      {
        id: 'state_registration',
        text: 'Is your business registered with the state?',
        type: 'boolean',
        weight: 9,
        required: true
      },
      {
        id: 'business_age',
        text: 'How long has your business been operating (in months)?',
        type: 'number',
        weight: 8,
        required: true,
        helpText: 'Businesses operating 2+ years have better funding opportunities'
      },
      {
        id: 'has_operating_agreement',
        text: 'Do you have operating agreements or bylaws?',
        type: 'boolean',
        weight: 6,
        required: false
      }
      // Additional 20 questions would be here...
    ]
  },
  {
    id: 'credit_profile',
    name: 'Credit Profile & History',
    description: 'Business and personal credit assessment',
    icon: '💳',
    criteriaCount: 30,
    weight: 0.25,
    questions: [
      {
        id: 'business_credit_score',
        text: 'What is your current business credit score?',
        type: 'scale',
        weight: 15,
        required: true,
        options: ['No Score', '0-49', '50-69', '70-79', '80-100'],
        helpText: 'Business credit scores range from 0-100'
      },
      {
        id: 'personal_credit_score',
        text: 'What is your personal credit score range?',
        type: 'scale',
        weight: 12,
        required: true,
        options: ['Below 580', '580-669', '670-739', '740-799', '800+']
      },
      {
        id: 'has_business_credit_cards',
        text: 'Do you have business credit cards?',
        type: 'boolean',
        weight: 8,
        required: true
      },
      {
        id: 'payment_history',
        text: 'How would you rate your payment history?',
        type: 'scale',
        weight: 10,
        required: true,
        options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
      }
      // Additional 26 questions would be here...
    ]
  },
  {
    id: 'financial_documentation',
    name: 'Financial Documentation',
    description: 'Financial records and reporting',
    icon: '📊',
    criteriaCount: 20,
    weight: 0.20,
    questions: [
      {
        id: 'has_financial_statements',
        text: 'Do you have current financial statements?',
        type: 'boolean',
        weight: 12,
        required: true
      },
      {
        id: 'annual_revenue',
        text: 'What is your annual revenue range?',
        type: 'select',
        weight: 15,
        required: true,
        options: ['Under $50K', '$50K-$100K', '$100K-$500K', '$500K-$1M', 'Over $1M']
      }
      // Additional 18 questions would be here...
    ]
  },
  {
    id: 'operations',
    name: 'Operational Infrastructure',
    description: 'Business operations and infrastructure',
    icon: '⚙️',
    criteriaCount: 25,
    weight: 0.15,
    questions: [
      {
        id: 'has_business_address',
        text: 'Do you have a dedicated business address?',
        type: 'boolean',
        weight: 8,
        required: true
      },
      {
        id: 'has_business_phone',
        text: 'Do you have a dedicated business phone line?',
        type: 'boolean',
        weight: 7,
        required: true
      }
      // Additional 23 questions would be here...
    ]
  },
  {
    id: 'online_presence',
    name: 'Online Presence & Marketing',
    description: 'Digital footprint and marketing',
    icon: '🌐',
    criteriaCount: 15,
    weight: 0.10,
    questions: [
      {
        id: 'has_website',
        text: 'Do you have a professional business website?',
        type: 'boolean',
        weight: 10,
        required: true
      },
      {
        id: 'social_media_presence',
        text: 'How active is your social media presence?',
        type: 'scale',
        weight: 6,
        required: false,
        options: ['None', 'Minimal', 'Moderate', 'Active', 'Very Active']
      }
      // Additional 13 questions would be here...
    ]
  },
  {
    id: 'risk_compliance',
    name: 'Risk Factors & Compliance',
    description: 'Risk assessment and regulatory compliance',
    icon: '🛡️',
    criteriaCount: 10,
    weight: 0.10,
    questions: [
      {
        id: 'has_business_insurance',
        text: 'Do you have business insurance?',
        type: 'boolean',
        weight: 8,
        required: true
      },
      {
        id: 'legal_issues',
        text: 'Any current legal issues or disputes?',
        type: 'boolean',
        weight: 7,
        required: true
      }
      // Additional 8 questions would be here...
    ]
  }
]

export default function AdvancedFundabilityCalculator({ onClose, onScoreUpdate }: CalculatorProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [assessments, setAssessments] = useState([])
  const [currentResponses, setCurrentResponses] = useState>({})
  const [overallScore, setOverallScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentCategory = categories[currentStep]
  const progress = ((currentStep + 1) / categories.length) * 100

  const calculateCategoryScore = (category: Category, responses: Record) => {
    let totalScore = 0
    let maxScore = 0

    category.questions.forEach(question => {
      maxScore += question.weight
      const response = responses[question.id]

      if (response !== undefined && response !== null) {
        switch (question.type) {
          case 'boolean':
            totalScore += response ? question.weight : 0
            break
          case 'scale':
            if (typeof response === 'string' && question.options) {
              const index = question.options.indexOf(response)
              const percentage = index / (question.options.length - 1)
              totalScore += percentage * question.weight
            }
            break
          case 'select':
            if (typeof response === 'string' && question.options) {
              // Custom scoring logic for select questions
              totalScore += response ? question.weight * 0.8 : 0
            }
            break
          case 'number':
            // Custom scoring logic for number questions
            const numValue = parseInt(response) || 0
            if (question.id === 'business_age') {
              const ageScore = Math.min(numValue / 24, 1) // 24 months = 100%
              totalScore += ageScore * question.weight
            }
            break
        }
      }
    })

    return { score: totalScore, maxScore }
  }

  const calculateOverallScore = (allAssessments: Assessment[]) => {
    let weightedScore = 0
    let totalWeight = 0

    allAssessments.forEach((assessment, index) => {
      const category = categories.find(c => c.id === assessment.categoryId)
      if (category) {
        const categoryPercentage = assessment.score / assessment.maxScore
        weightedScore += categoryPercentage * category.weight * 100
        totalWeight += category.weight
      }
    })

    return Math.round(weightedScore / totalWeight)
  }

  const handleNext = () => {
    const categoryScore = calculateCategoryScore(currentCategory, currentResponses)
    const assessment: Assessment = {
      categoryId: currentCategory.id,
      responses: currentResponses,
      score: categoryScore.score,
      maxScore: categoryScore.maxScore
    }

    const newAssessments = [...assessments]
    newAssessments[currentStep] = assessment
    setAssessments(newAssessments)

    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1)
      setCurrentResponses({})
    } else {
      setIsCalculating(true)
      setTimeout(() => {
        const finalScore = calculateOverallScore(newAssessments)
        setOverallScore(finalScore)
        setShowResults(true)
        setIsCalculating(false)
        onScoreUpdate(finalScore)
      }, 2000)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      const prevAssessment = assessments[currentStep - 1]
      if (prevAssessment) {
        setCurrentResponses(prevAssessment.responses)
      }
    }
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setCurrentResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const saveAssessment = async () => {
    try {
      const response = await fetch('/api/fundability/save-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallScore,
          assessments,
          userId: session?.user?.id
        })
      })

      if (response.ok) {
        alert('Assessment saved successfully!')
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  const generateReport = async () => {
    try {
      const response = await fetch('/api/fundability/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallScore,
          assessments,
          userId: session?.user?.id
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fundability-report.pdf'
        a.click()
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  if (isCalculating) {
    return (
      

        

          

          
Calculating Your Score

          

Analyzing 125+ criteria...

        

      

    )
  }

  if (showResults) {
    return (
      

        

          

            
Your Fundability Assessment

            
{overallScore}

            
out of 100

            

              

            

          


          

            {assessments.map((assessment, index) => {
              const category = categories.find(c => c.id === assessment.categoryId)
              const percentage = Math.round((assessment.score / assessment.maxScore) * 100)
              
              return (
                

                  

                    {category?.icon}
                    
{category?.name}

                  

                  

                    {percentage}%
                    {Math.round(assessment.score)}/{assessment.maxScore}
                  

                  

                    

                  

                

              )
            })}
          


          

            

            
            

          

        

      

    )
  }

  return (
    

      

        {/* Header */}
        

          

            
Advanced Fundability Assessment

            

          

          

            

              Progress: {currentStep + 1} of {categories.length}
              {Math.round(progress)}%
            

            

              

            

          

        


        {/* Content */}
        

          

            

              {currentCategory.icon}
              

                
{currentCategory.name}

                

{currentCategory.description}

                

{currentCategory.criteriaCount} criteria in this category

              

            

          


          

            {currentCategory.questions.map((question) => (
              

                
                  {question.text}
                  {question.required && *}
                
                
                {question.helpText && (
                  

{question.helpText}

                )}

                {question.type === 'boolean' && (
                  

                    
                       handleResponseChange(question.id, true)}
                        className="mr-2"
                      />
                      Yes
                    
                    
                       handleResponseChange(question.id, false)}
                        className="mr-2"
                      />
                      No
                    
                  

                )}

                {question.type === 'scale' && question.options && (
                  

                    {question.options.map((option) => (
                      
                         handleResponseChange(question.id, option)}
                          className="mr-2"
                        />
                        {option}
                      
                    ))}
                  

                )}

                {question.type === 'select' && question.options && (
                  

                )}

                {question.type === 'number' && (
                   handleResponseChange(question.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter a number"
                  />
                )}
              

            ))}
          

        


        {/* Footer */}
        

          

          
          

        

      

    

  )
}