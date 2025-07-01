import { FundabilityCriteria } from '@/types/fundability';

export const FUNDABILITY_CRITERIA_DATA: FundabilityCriteria[] = [
  // Business Foundation (25 criteria)
  {
    id: 'bf-001',
    category: 'Business Foundation',
    name: 'EIN (Federal Tax ID)',
    description: 'Business has a valid EIN from the IRS',
    weight: 10,
    required: true,
    type: 'boolean'
  },
  {
    id: 'bf-002',
    category: 'Business Foundation',
    name: 'State Business Registration',
    description: 'Business is properly registered with the state',
    weight: 9,
    required: true,
    type: 'boolean'
  },
  {
    id: 'bf-003',
    category: 'Business Foundation',
    name: 'Business License',
    description: 'Current business license for your industry',
    weight: 8,
    required: true,
    type: 'boolean'
  },
  {
    id: 'bf-004',
    category: 'Business Foundation',
    name: 'DBA Registration',
    description: 'Doing Business As name properly registered',
    weight: 6,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bf-005',
    category: 'Business Foundation',
    name: 'Business Age',
    description: 'Business has been operating for at least 2 years',
    weight: 8,
    required: false,
    type: 'number'
  },

  // Legal Structure (20 criteria)
  {
    id: 'ls-001',
    category: 'Legal Structure',
    name: 'Corporate Structure',
    description: 'Business is structured as LLC, Corporation, or Partnership',
    weight: 9,
    required: true,
    type: 'select',
    options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']
  },
  {
    id: 'ls-002',
    category: 'Legal Structure',
    name: 'Registered Agent',
    description: 'Has a registered agent for legal documents',
    weight: 7,
    required: true,
    type: 'boolean'
  },
  {
    id: 'ls-003',
    category: 'Legal Structure',
    name: 'Articles of Incorporation',
    description: 'Filed articles of incorporation with state',
    weight: 8,
    required: true,
    type: 'boolean'
  },
  {
    id: 'ls-004',
    category: 'Legal Structure',
    name: 'Operating Agreement',
    description: 'Has current operating agreement or bylaws',
    weight: 6,
    required: false,
    type: 'boolean'
  },

  // Banking & Finance (30 criteria)
  {
    id: 'bf-101',
    category: 'Banking & Finance',
    name: 'Business Bank Account',
    description: 'Separate business bank account established',
    weight: 10,
    required: true,
    type: 'boolean'
  },
  {
    id: 'bf-102',
    category: 'Banking & Finance',
    name: 'Business Credit Card',
    description: 'At least one business credit card in company name',
    weight: 8,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bf-103',
    category: 'Banking & Finance',
    name: 'Banking Relationship',
    description: 'Established relationship with business banker',
    weight: 7,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bf-104',
    category: 'Banking & Finance',
    name: 'Business Line of Credit',
    description: 'Has an established business line of credit',
    weight: 9,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bf-105',
    category: 'Banking & Finance',
    name: 'Positive Cash Flow',
    description: 'Demonstrates consistent positive cash flow',
    weight: 9,
    required: false,
    type: 'boolean'
  },

  // Business Credit Profile (25 criteria)
  {
    id: 'bcp-001',
    category: 'Business Credit Profile',
    name: 'DUNS Number',
    description: 'Has a DUNS number from Dun & Bradstreet',
    weight: 9,
    required: true,
    type: 'boolean'
  },
  {
    id: 'bcp-002',
    category: 'Business Credit Profile',
    name: 'Experian Business Profile',
    description: 'Business profile established with Experian',
    weight: 8,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bcp-003',
    category: 'Business Credit Profile',
    name: 'Equifax Business Profile',
    description: 'Business profile established with Equifax',
    weight: 8,
    required: false,
    type: 'boolean'
  },
  {
    id: 'bcp-004',
    category: 'Business Credit Profile',
    name: 'Trade References',
    description: 'Has at least 3 positive trade references',
    weight: 7,
    required: false,
    type: 'number'
  },
  {
    id: 'bcp-005',
    category: 'Business Credit Profile',
    name: 'Net Terms Accounts',
    description: 'Has accounts that report to credit bureaus',
    weight: 8,
    required: false,
    type: 'boolean'
  },

  // Marketing Presence (15 criteria)
  {
    id: 'mp-001',
    category: 'Marketing Presence',
    name: 'Professional Website',
    description: 'Has a professional business website',
    weight: 8,
    required: true,
    type: 'boolean'
  },
  {
    id: 'mp-002',
    category: 'Marketing Presence',
    name: 'Business Email',
    description: 'Uses professional business email (not Gmail/Yahoo)',
    weight: 6,
    required: false,
    type: 'boolean'
  },
  {
    id: 'mp-003',
    category: 'Marketing Presence',
    name: 'Google My Business',
    description: 'Claimed and optimized Google My Business listing',
    weight: 5,
    required: false,
    type: 'boolean'
  },
  {
    id: 'mp-004',
    category: 'Marketing Presence',
    name: 'Business Address',
    description: 'Physical business address (not PO Box)',
    weight: 7,
    required: true,
    type: 'boolean'
  },
  {
    id: 'mp-005',
    category: 'Marketing Presence',
    name: 'Business Phone',
    description: 'Dedicated business phone number',
    weight: 6,
    required: true,
    type: 'boolean'
  },

  // Operational Excellence (10 criteria)
  {
    id: 'oe-001',
    category: 'Operational Excellence',
    name: 'Business Insurance',
    description: 'Current general liability insurance',
    weight: 7,
    required: true,
    type: 'boolean'
  },
  {
    id: 'oe-002',
    category: 'Operational Excellence',
    name: 'Professional Services',
    description: 'Uses professional accounting/legal services',
    weight: 5,
    required: false,
    type: 'boolean'
  },
  {
    id: 'oe-003',
    category: 'Operational Excellence',
    name: 'Employee Records',
    description: 'Maintains proper employee records if applicable',
    weight: 4,
    required: false,
    type: 'boolean'
  },

  // Documentation (15 criteria)
  {
    id: 'doc-001',
    category: 'Documentation',
    name: 'Financial Statements',
    description: 'Current profit & loss statements',
    weight: 9,
    required: true,
    type: 'boolean'
  },
  {
    id: 'doc-002',
    category: 'Documentation',
    name: 'Tax Returns',
    description: 'Business tax returns for past 2 years',
    weight: 8,
    required: true,
    type: 'boolean'
  },
  {
    id: 'doc-003',
    category: 'Documentation',
    name: 'Business Plan',
    description: 'Current business plan with financial projections',
    weight: 6,
    required: false,
    type: 'boolean'
  },
  {
    id: 'doc-004',
    category: 'Documentation',
    name: 'Bank Statements',
    description: 'Business bank statements for past 12 months',
    weight: 7,
    required: true,
    type: 'boolean'
  },

  // Financial Health (10 criteria)
  {
    id: 'fh-001',
    category: 'Financial Health',
    name: 'Revenue Growth',
    description: 'Shows consistent revenue growth',
    weight: 8,
    required: false,
    type: 'boolean'
  },
  {
    id: 'fh-002',
    category: 'Financial Health',
    name: 'Debt-to-Income Ratio',
    description: 'Healthy debt-to-income ratio (under 30%)',
    weight: 7,
    required: false,
    type: 'number'
  },
  {
    id: 'fh-003',
    category: 'Financial Health',
    name: 'Emergency Fund',
    description: 'Has 3-6 months operating expenses saved',
    weight: 6,
    required: false,
    type: 'boolean'
  },
  {
    id: 'fh-004',
    category: 'Financial Health',
    name: 'Customer Diversity',
    description: 'No single customer represents >20% of revenue',
    weight: 5,
    required: false,
    type: 'boolean'
  }
];