import type { AssessmentQuestion } from '@/contexts/AssessmentContext';

export const assessmentQuestions: AssessmentQuestion[] = [
  // Business Foundation (5 questions)
  {
    id: 'has_ein',
    category: 'Business Foundation',
    question: 'Do you have an Employer Identification Number (EIN) for your business?',
    type: 'boolean',
    required: true,
    weight: 1.2,
    isCritical: true,
    helpText: 'An EIN is essential for business banking, credit, and tax purposes.'
  },
  {
    id: 'business_structure',
    category: 'Business Foundation',
    question: 'What is your business legal structure?',
    type: 'select',
    options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship'],
    required: true,
    weight: 1.0,
    isCritical: true,
    helpText: 'Your business structure affects liability, taxes, and funding opportunities.'
  },
  {
    id: 'business_license',
    category: 'Business Foundation',
    question: 'Do you have all required business licenses for your industry?',
    type: 'boolean',
    required: true,
    weight: 1.1,
    isCritical: true,
    helpText: 'Proper licensing demonstrates compliance and legitimacy.'
  },
  {
    id: 'business_address',
    category: 'Business Foundation',
    question: 'Do you have a dedicated business address (not a PO Box)?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'A physical address builds credibility with lenders and vendors.'
  },
  {
    id: 'time_in_business',
    category: 'Business Foundation',
    question: 'How many years has your business been operating?',
    type: 'number',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'Longer operating history generally improves funding opportunities.'
  },

  // Banking & Finance (4 questions)
  {
    id: 'business_bank_account',
    category: 'Banking & Finance',
    question: 'Do you have a dedicated business bank account?',
    type: 'boolean',
    required: true,
    weight: 1.3,
    isCritical: true,
    helpText: 'Separate business banking is crucial for credit building and financial management.'
  },
  {
    id: 'annual_revenue',
    category: 'Banking & Finance',
    question: 'What is your annual business revenue?',
    type: 'number',
    required: true,
    weight: 1.2,
    isCritical: false,
    helpText: 'Higher revenue demonstrates business viability and repayment capacity.'
  },
  {
    id: 'business_credit_card',
    category: 'Banking & Finance',
    question: 'Do you have a business credit card?',
    type: 'boolean',
    required: true,
    weight: 1.1,
    isCritical: false,
    helpText: 'Business credit cards help build credit history and manage cash flow.'
  },
  {
    id: 'accounting_system',
    category: 'Banking & Finance',
    question: 'Do you use a professional accounting system (QuickBooks, etc.)?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'Professional accounting demonstrates financial organization and preparedness.'
  },

  // Business Credit Profile (4 questions)
  {
    id: 'duns_number',
    category: 'Business Credit Profile',
    question: 'Do you have a DUNS number from Dun & Bradstreet?',
    type: 'boolean',
    required: true,
    weight: 1.4,
    isCritical: true,
    helpText: 'DUNS numbers are essential for building business credit and accessing financing.'
  },
  {
    id: 'trade_references',
    category: 'Business Credit Profile',
    question: 'Do you have established trade credit accounts with vendors?',
    type: 'select',
    options: ['Yes, 5+ accounts', 'Yes, 2-4 accounts', 'Yes, 1 account', 'No'],
    required: true,
    weight: 1.3,
    isCritical: false,
    helpText: 'Trade credit helps establish payment history and creditworthiness.'
  },
  {
    id: 'business_credit_monitoring',
    category: 'Business Credit Profile',
    question: 'Do you monitor your business credit reports regularly?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'Regular monitoring helps catch errors and track credit building progress.'
  },
  {
    id: 'personal_credit_score',
    category: 'Business Credit Profile',
    question: 'What is your personal credit score range?',
    type: 'select',
    options: ['750+', '700-749', '650-699', '600-649', '550-599', 'Below 550'],
    required: true,
    weight: 1.2,
    isCritical: true,
    helpText: 'Personal credit often affects business financing approval and terms.'
  },

  // Marketing Presence (3 questions)
  {
    id: 'business_website',
    category: 'Marketing Presence',
    question: 'Do you have a professional business website?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'A professional website builds credibility and demonstrates business legitimacy.'
  },
  {
    id: 'google_business_listing',
    category: 'Marketing Presence',
    question: 'Do you have a Google My Business listing?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'Google listings improve visibility and credibility with lenders.'
  },
  {
    id: 'business_phone',
    category: 'Marketing Presence',
    question: 'Do you have a dedicated business phone number?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'A dedicated business phone adds professionalism and separates business from personal.'
  },

  // Documentation (4 questions)
  {
    id: 'business_plan',
    category: 'Documentation',
    question: 'Do you have a current, comprehensive business plan?',
    type: 'boolean',
    required: true,
    weight: 1.1,
    isCritical: false,
    helpText: 'Business plans demonstrate strategic thinking and planning to lenders.'
  },
  {
    id: 'financial_statements',
    category: 'Documentation',
    question: 'Do you have current financial statements (P&L, Balance Sheet)?',
    type: 'boolean',
    required: true,
    weight: 1.2,
    isCritical: true,
    helpText: 'Current financial statements are required for most business financing.'
  },
  {
    id: 'tax_returns',
    category: 'Documentation',
    question: 'Are your business tax returns current and filed?',
    type: 'boolean',
    required: true,
    weight: 1.2,
    isCritical: true,
    helpText: 'Current tax returns prove income and demonstrate compliance.'
  },
  {
    id: 'insurance_coverage',
    category: 'Documentation',
    question: 'Do you have appropriate business insurance coverage?',
    type: 'boolean',
    required: true,
    weight: 1.0,
    isCritical: false,
    helpText: 'Insurance protects your business and demonstrates risk management.'
  }
];