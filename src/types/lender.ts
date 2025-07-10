export interface Lender {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  lender_type: 'bank' | 'credit_union' | 'online_lender' | 'sba_preferred' | 'alternative' | 'equipment' | 'factoring';
  min_loan_amount: number;
  max_loan_amount: number;
  min_credit_score: number;
  min_time_in_business: number; // months
  interest_rate_range: {
    min: number;
    max: number;
  };
  loan_products: LoanProduct[];
  industries_served: string[];
  states_served: string[];
  requirements: LenderRequirement[];
  processing_time: string; // e.g., "3-5 business days"
  approval_rate: number; // percentage
  rating: number; // 1-5 stars
  reviews_count: number;
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
    application_url?: string;
  };
  partnership_status: 'active' | 'pending' | 'inactive';
  commission_rate?: number;
  api_integration?: {
    has_api: boolean;
    api_endpoint?: string;
    api_key_required: boolean;
    webhook_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  type: 'term_loan' | 'line_of_credit' | 'equipment_financing' | 'working_capital' | 'sba_loan' | 'merchant_cash_advance' | 'invoice_factoring' | 'real_estate';
  min_amount: number;
  max_amount: number;
  term_range: {
    min_months: number;
    max_months: number;
  };
  interest_rate: {
    min: number;
    max: number;
  };
  fees: {
    origination_fee?: number;
    application_fee?: number;
    monthly_fee?: number;
  };
  collateral_required: boolean;
  personal_guarantee_required: boolean;
  features: string[];
}

export interface LenderRequirement {
  id: string;
  requirement_type: 'credit_score' | 'revenue' | 'time_in_business' | 'industry' | 'location' | 'collateral' | 'documents';
  description: string;
  required_value?: string | number;
  is_mandatory: boolean;
}

export interface LenderMatch {
  lender: Lender;
  match_score: number;
  match_reasons: string[];
  recommended_products: LoanProduct[];
  estimated_approval_odds: number;
  estimated_rates: {
    min: number;
    max: number;
  };
}

export interface LoanApplication {
  id: string;
  user_id: string;
  lender_id: string;
  loan_product_id: string;
  application_data: {
    requested_amount: number;
    loan_purpose: string;
    assessment_data?: any;
    business_info?: any;
    financial_info?: any;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded';
  submitted_at?: string;
  decision_at?: string;
  decision_notes?: string;
  tracking_id?: string;
  external_application_id?: string;
  created_at: string;
  updated_at: string;
}