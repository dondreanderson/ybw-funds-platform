import { NextResponse } from 'next/server'

const categories = [
  {
    id: 'business-structure',
    name: 'Business Structure & Registration',
    description: 'Legal entity setup and compliance',
    weight: 25,
    criteria: [
      {
        id: 'ein',
        question: 'Does your business have an EIN?',
        type: 'boolean',
        weight: 5,
        required: true
      },
      {
        id: 'business-license',
        question: 'Do you have required business licenses?',
        type: 'boolean',
        weight: 4,
        required: true
      },
      // ... 20+ more criteria
    ]
  },
  // ... 5 more categories
]

export async function GET() {
  return NextResponse.json(categories)
}