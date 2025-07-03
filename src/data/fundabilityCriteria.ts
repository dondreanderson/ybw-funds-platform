// src/data/fundabilityCriteria.ts

export const FUNDABILITY_CATEGORIES = [
  {
    id: 'business-structure',
    name: 'Business Structure & Registration',
    description: 'Foundation of your business legal structure',
    weight: 25,
    criteria: [
      {
        id: 'ein',
        question: 'Does your business have an EIN (Employer Identification Number)?',
        type: 'boolean',
        weight: 5,
        required: true,
        helpText: 'An EIN is essential for business credit building'
      },
      {
        id: 'business-type',
        question: 'What type of business entity do you have?',
        type: 'select',
        weight: 4,
        options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'],
        required: true
      },
      {
        id: 'state-registration',
        question: 'Is your business registered with the state?',
        type: 'boolean',
        weight: 4,
        required: true
      },
      {
        id: 'business-license',
        question: 'Do you have all required business licenses?',
        type: 'boolean',
        weight: 3,
        required: true
      },
      {
        id: 'dba-filing',
        question: 'If applicable, have you filed a DBA (Doing Business As)?',
        type: 'boolean',
        weight: 2,
        required: false
      },
      {
        id: 'business-age',
        question: 'How long has your business been operating (in months)?',
        type: 'number',
        weight: 7,
        required: true,
        scoring: {
          '0-6': 0,
          '7-12': 3,
          '13-24': 5,
          '25+': 7
        }
      }
      // ... 19 more criteria
    ]
  },
  {
    id: 'credit-profile',
    name: 'Credit Profile & History',
    description: 'Your business and personal credit standing',
    weight: 30,
    criteria: [
      {
        id: 'business-credit-established',
        question: 'Have you established business credit with any vendors?',
        type: 'boolean',
        weight: 6,
        required: true
      },
      {
        id: 'credit-monitoring',
        question: 'Do you actively monitor your business credit reports?',
        type: 'boolean',
        weight: 4,
        required: true
      },
      {
        id: 'duns-number',
        question: 'Do you have a D-U-N-S number from Dun & Bradstreet?',
        type: 'boolean',
        weight: 5,
        required: true
      },
      {
        id: 'business-credit-score',
        question: 'What is your approximate business credit score?',
        type: 'select',
        weight: 8,
        options: ['No Score', '0-49', '50-69', '70-79', '80-89', '90-100'],
        required: false
      },
      {
        id: 'personal-credit-score',
        question: 'What is your personal credit score range?',
        type: 'select',
        weight: 7,
        options: ['Below 600', '600-649', '650-699', '700-749', '750-799', '800+'],
        required: true
      }
      // ... 25 more criteria
    ]
  }
  // ... 4 more categories with 125+ total criteria
]

export const SCORING_ALGORITHM = {
  categoryWeights: {
    'business-structure': 25,
    'credit-profile': 30,
    'financial-documentation': 20,
    'operational-infrastructure': 15,
    'online-presence': 10
  },
  
  calculateCategoryScore: (answers: Record<string, any>, criteria: any[]) => {
    let totalScore = 0
    let maxScore = 0
    
    criteria.forEach(criterion => {
      maxScore += criterion.weight
      const answer = answers[criterion.id]
      
      if (answer !== undefined) {
        totalScore += calculateCriterionScore(answer, criterion)
      }
    })
    
    return { score: totalScore, maxScore }
  },
  
  calculateOverallScore: (categoryScores: any[], categories: any[]) => {
    let weightedSum = 0
    let totalWeight = 0
    
    categoryScores.forEach(categoryScore => {
      const category = categories.find(c => c.id === categoryScore.categoryId)
      if (category && categoryScore.maxScore > 0) {
        const percentage = categoryScore.score / categoryScore.maxScore
        weightedSum += percentage * category.weight
        totalWeight += category.weight
      }
    })
    
    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0
  }
}