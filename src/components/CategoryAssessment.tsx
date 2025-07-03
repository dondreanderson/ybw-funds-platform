'use client'

import React, { useState, useEffect } from 'react'

interface CategoryAssessmentProps {
  category: Category
  assessment?: Assessment
  onAssessmentUpdate: (assessment: Assessment) => void
}

export function CategoryAssessment({ 
  category, 
  assessment, 
  onAssessmentUpdate 
}: CategoryAssessmentProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(assessment?.answers || {})
  const [currentScore, setCurrentScore] = useState(assessment?.score || 0)

  useEffect(() => {
    // Calculate score based on answers
    let totalScore = 0
    let completedCriteria = 0

    category.criteria.forEach(criterion => {
      const answer = answers[criterion.id]
      if (answer !== undefined && answer !== null && answer !== '') {
        completedCriteria++
        
        switch (criterion.type) {
          case 'boolean':
            if (answer === true || answer === 'yes') {
              totalScore += criterion.weight
            }
            break
          case 'scale':
            // Scale of 1-5, calculate percentage
            const percentage = (parseInt(answer) - 1) / 4
            totalScore += criterion.weight * percentage
            break
          case 'select':
            // Custom scoring based on selection
            const optionIndex = criterion.options?.indexOf(answer)
            if (optionIndex !== undefined && optionIndex >= 0) {
              const optionScore = (optionIndex + 1) / (criterion.options?.length || 1)
              totalScore += criterion.weight * optionScore
            }
            break
          case 'number':
            // Custom scoring for numerical inputs
            if (answer > 0) {
              totalScore += criterion.weight
            }
            break
        }
      }
    })

    setCurrentScore(totalScore)

    // Update parent component
    const updatedAssessment: Assessment = {
      categoryId: category.id,
      score: totalScore,
      maxScore: category.criteria.reduce((sum, c) => sum + c.weight, 0),
      completedCriteria,
      totalCriteria: category.criteria.length,
      answers
    }

    onAssessmentUpdate(updatedAssessment)
  }, [answers, category, onAssessmentUpdate])

  const handleAnswerChange = (criterionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [criterionId]: value
    }))
  }

  const getProgressPercentage = () => {
    const completed = Object.keys(answers).filter(key => {
      const answer = answers[key]
      return answer !== undefined && answer !== null && answer !== ''
    }).length
    return (completed / category.criteria.length) * 100
  }

  const getScorePercentage = () => {
    const maxScore = category.criteria.reduce((sum, c) => sum + c.weight, 0)
    return maxScore > 0 ? (currentScore / maxScore) * 100 : 0
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{category.name}</h3>
        <p className="text-gray-600 mb-4">{category.description}</p>
        
        {/* Progress Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Category Score</span>
              <span>{Math.round(getScorePercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getScorePercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Questions */}
      <div className="space-y-4">
        {category.criteria.map((criterion, index) => (
          <div key={criterion.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  {index + 1}. {criterion.question}
                  {criterion.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                <p className="text-sm text-gray-500">Weight: {criterion.weight} points</p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mt-3">
              {criterion.type === 'boolean' && (
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={criterion.id}
                      value="true"
                      checked={answers[criterion.id] === true}
                      onChange={() => handleAnswerChange(criterion.id, true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={criterion.id}
                      value="false"
                      checked={answers[criterion.id] === false}
                      onChange={() => handleAnswerChange(criterion.id, false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              )}

              {criterion.type === 'scale' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Poor (1)</span>
                    <span>Excellent (5)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={answers[criterion.id] || 1}
                    onChange={(e) => handleAnswerChange(criterion.id, e.target.value)}
                    className="w-full"
                  />
                  <div className="text-center mt-1">
                    <span className="text-lg font-semibold text-blue-600">
                      {answers[criterion.id] || 1}
                    </span>
                  </div>
                </div>
              )}

              {criterion.type === 'select' && (
                <select
                  value={answers[criterion.id] || ''}
                  onChange={(e) => handleAnswerChange(criterion.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an option...</option>
                  {criterion.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {criterion.type === 'number' && (
                <input
                  type="number"
                  value={answers[criterion.id] || ''}
                  onChange={(e) => handleAnswerChange(criterion.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter a number..."
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}