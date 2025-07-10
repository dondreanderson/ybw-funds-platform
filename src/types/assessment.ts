export interface AssessmentStep {
  id: number;
  title: string;
  description: string;
}

export interface BusinessFoundationData {
  businessName: string;
  ein: string;
  businessType: string;
  stateOfIncorporation: string;
  yearEstablished: number;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  website?: string;
}

export interface FinancialHealthData {
  annualRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  creditScore: number;
  existingDebt: number;
  cashFlow: 'positive' | 'negative' | 'breakeven';
  profitMargin: number;
  accountsReceivable: number;
  hasAccountant: boolean;
  taxesUpToDate: boolean;
  hasFinancialStatements: boolean;
}

export interface BankingRelationshipsData {
  primaryBank: string;
  accountsOpen: number;
  bankingYears: number;
  averageBalance: number;
  hasBusinessChecking: boolean;
  hasBusinessSavings: boolean;
  hasBusinessCreditCard: boolean;
  hasLineOfCredit: boolean;
  creditCardLimit: number;
  monthlyDeposits: number;
  nsfIncidents: number;
  hasLoanHistory: boolean;
}

export interface DigitalPresenceData {
  hasWebsite: boolean;
  websiteAge: number;
  hasGoogleBusiness: boolean;
  hasSocialMedia: boolean;
  socialMediaPlatforms: string[];
  onlineReviews: number;
  averageRating: number;
  hasOnlineStore: boolean;
  digitalMarketingBudget: number;
  hasEmailMarketing: boolean;
}

export interface IndustryOperationsData {
  industry: string;
  naicsCode: string;
  numberOfEmployees: number;
  hasPhysicalLocation: boolean;
  businessLicenses: string[];
  hasInsurance: boolean;
  hasContracts: boolean;
  hasInventory: boolean;
  inventoryValue: number;
  hasEquipment: boolean;
  equipmentValue: number;
}

export interface AssessmentData {
  businessFoundation: Partial<BusinessFoundationData>;
  financialHealth: Partial<FinancialHealthData>;
  bankingRelationships: Partial<BankingRelationshipsData>;
  digitalPresence: Partial<DigitalPresenceData>;
  industryOperations: Partial<IndustryOperationsData>;
  metadata: {
    startedAt: string;
    lastSavedAt: string | null;
    completedSteps: number[];
  };
}
