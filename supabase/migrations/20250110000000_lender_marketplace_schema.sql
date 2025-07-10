CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE lenders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    lender_type VARCHAR(50) NOT NULL CHECK (lender_type IN ('bank', 'credit_union', 'online_lender', 'sba_preferred', 'alternative', 'equipment', 'factoring')),
    min_loan_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_loan_amount DECIMAL(15,2) NOT NULL,
    min_credit_score INTEGER NOT NULL DEFAULT 500,
    min_time_in_business INTEGER NOT NULL DEFAULT 0, -- months
    interest_rate_min DECIMAL(5,2) NOT NULL,
    interest_rate_max DECIMAL(5,2) NOT NULL,
    industries_served TEXT[] DEFAULT '{}',
    states_served TEXT[] DEFAULT '{}',
    processing_time VARCHAR(100),
    approval_rate DECIMAL(5,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website_url TEXT,
    application_url TEXT,
    partnership_status VARCHAR(20) DEFAULT 'pending' CHECK (partnership_status IN ('active', 'pending', 'inactive')),
    commission_rate DECIMAL(5,2) DEFAULT 0,
    has_api_integration BOOLEAN DEFAULT FALSE,
    api_endpoint TEXT,
    api_key_required BOOLEAN DEFAULT FALSE,
    webhook_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE loan_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('term_loan', 'line_of_credit', 'equipment_financing', 'working_capital', 'sba_loan', 'merchant_cash_advance', 'invoice_factoring', 'real_estate')),
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    min_term_months INTEGER NOT NULL,
    max_term_months INTEGER NOT NULL,
    interest_rate_min DECIMAL(5,2) NOT NULL,
    interest_rate_max DECIMAL(5,2) NOT NULL,
    origination_fee DECIMAL(5,2) DEFAULT 0,
    application_fee DECIMAL(10,2) DEFAULT 0,
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    collateral_required BOOLEAN DEFAULT FALSE,
    personal_guarantee_required BOOLEAN DEFAULT FALSE,
    features TEXT[] DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lender_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('credit_score', 'revenue', 'time_in_business', 'industry', 'location', 'collateral', 'documents')),
    description TEXT NOT NULL,
    required_value TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE loan_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    lender_id UUID REFERENCES lenders(id),
    loan_product_id UUID REFERENCES loan_products(id),
    assessment_id UUID REFERENCES assessments(id),
    application_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'funded', 'withdrawn')),
    requested_amount DECIMAL(15,2) NOT NULL,
    loan_purpose VARCHAR(100),
    submitted_at TIMESTAMP WITH TIME ZONE,
    decision_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    tracking_id VARCHAR(100),
    external_application_id VARCHAR(255),
    lender_response JSONB,
    commission_earned DECIMAL(10,2) DEFAULT 0,
    referral_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE application_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lender_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    applications_received INTEGER DEFAULT 0,
    applications_approved INTEGER DEFAULT 0,
    applications_rejected INTEGER DEFAULT 0,
    total_funded_amount DECIMAL(15,2) DEFAULT 0,
    commission_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lender_id, date)
);

CREATE INDEX idx_lenders_partnership_status ON lenders(partnership_status);
CREATE INDEX idx_lenders_lender_type ON lenders(lender_type);
CREATE INDEX idx_lenders_rating ON lenders(rating DESC);
CREATE INDEX idx_lenders_is_featured ON lenders(is_featured);
CREATE INDEX idx_loan_products_lender_id ON loan_products(lender_id);
CREATE INDEX idx_loan_products_type ON loan_products(product_type);
CREATE INDEX idx_loan_applications_user_email ON loan_applications(user_email);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_lender_id ON loan_applications(lender_id);
CREATE INDEX idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX idx_lender_analytics_lender_date ON lender_analytics(lender_id, date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;

$$ language 'plpgsql';

CREATE TRIGGER update_lenders_updated_at BEFORE UPDATE ON lenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active lenders" ON lenders
    FOR SELECT USING (partnership_status = 'active');

CREATE POLICY "Admins can manage lenders" ON lenders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for loan products (public read, admin write)
CREATE POLICY "Public can view active loan products" ON loan_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage loan products" ON loan_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for loan applications (users can see their own, admins can see all)
CREATE POLICY "Users can view their own applications" ON loan_applications
    FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can create applications" ON loan_applications
    FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own applications" ON loan_applications
    FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all applications" ON loan_applications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');