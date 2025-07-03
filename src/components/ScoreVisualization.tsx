'use client'

import React, { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

interface ScoreVisualizationProps {
  overallScore: number
  categoryAssessments: Assessment[]
  categories: Category[]
}

export function ScoreVisualization({ 
  overallScore, 
  categoryAssessments, 
  categories 
}: ScoreVisualizationProps) {
  const radarChartRef = useRef<HTMLCanvasElement>(null)
  const donutChartRef = useRef<HTMLCanvasElement>(null)
  const radarChart = useRef<Chart | null>(null)
  const donutChart = useRef<Chart | null>(null)

  useEffect(() => {
    // Radar Chart
    if (radarChartRef.current) {
      if (radarChart.current) {
        radarChart.current.destroy()
      }

      const categoryScores = categories.map(category => {
        const assessment = categoryAssessments.find(a => a.categoryId === category.id)
        return assessment && assessment.maxScore > 0 ? 
          (assessment.score / assessment.maxScore) * 100 : 0
      })

      radarChart.current = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: categories.map(c => c.name),
          datasets: [{
            label: 'Your Score',
            data: categoryScores,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              min: 0,
              max: 100,
              beginAtZero: true,
              ticks: {
                stepSize: 20
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    // Donut Chart
    if (donutChartRef.current) {
      if (donutChart.current) {
        donutChart.current.destroy()
      }

      const completionData = categoryAssessments.map(assessment => 
        (assessment.completedCriteria / assessment.totalCriteria) * 100
      )

      donutChart.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: categories.map(c => c.name),
          datasets: [{
            data: completionData,
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    return () => {
      if (radarChart.current) radarChart.current.destroy()
      if (donutChart.current) donutChart.current.destroy()
    }
  }, [categoryAssessments, categories])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B+'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C+'
    if (score >= 40) return 'C'
    return 'D'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Display */}
      <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Overall Fundability Score
        </h3>
        <div className="relative inline-block">
          <div className={`text-6xl font-bold rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-2 ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center">
            {getScoreGrade(overallScore)}
          </div>
        </div>
        <p className="text-gray-600 mt-2">out of 100</p>
        
        {/* Score Interpretation */}
        <div className="mt-4 text-sm">
          {overallScore >= 80 && (
            <p className="text-green-700">
              <strong>Excellent:</strong> Your business shows strong fundability potential
            </p>
          )}
          {overallScore >= 60 && overallScore < 80 && (
            <p className="text-yellow-700">
              <strong>Good:</strong> Your business has solid fundability with room for improvement
            </p>
          )}
          {overallScore >= 40 && overallScore < 60 && (
            <p className="text-orange-700">
              <strong>Fair:</strong> Your business needs significant improvements for optimal fundability
            </p>
          )}
          {overallScore < 40 && (
            <p className="text-red-700">
              <strong>Needs Improvement:</strong> Focus on fundamental business structure improvements
            </p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Category Performance</h4>
          <canvas ref={radarChartRef} style={{ height: '300px' }}></canvas>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Completion Status</h4>
          <canvas ref={donutChartRef} style={{ height: '300px' }}></canvas>
        </div>
      </div>

      {/* Detailed Category Scores */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Detailed Category Analysis</h4>
        <div className="space-y-3">
          {categories.map(category => {
            const assessment = categoryAssessments.find(a => a.categoryId === category.id)
            const score = assessment && assessment.maxScore > 0 ? 
              (assessment.score / assessment.maxScore) * 100 : 0
            const completion = assessment ? 
              (assessment.completedCriteria / assessment.totalCriteria) * 100 : 0

            return (
              <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-800">{category.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                    {Math.round(score)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Score</span>
                      <span>{Math.round(score)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Completion</span>
                      <span>{Math.round(completion)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}