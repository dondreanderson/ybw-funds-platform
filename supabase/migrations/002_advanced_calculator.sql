-- Advanced Fundability Calculator Schema

-- Enhanced fundability assessments table
CREATE TABLE IF NOT EXISTS advanced_fundability_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  assessment_date TIMESTAMP DEFAULT NOW(),
  assessment_version VARCHAR(10) DEFAULT '2.0',
  completion_time_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'completed',
  metadata JSONB DEFAULT '{}'
);

-- Category assessments table
CREATE TABLE IF NOT EXISTS category_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES advanced_fundability_assessments(id) ON DELETE CASCADE,
  category_id VARCHAR(50) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  score DECIMAL(10,2) NOT NULL,
  max_score DECIMAL(10,2) NOT NULL,
  weight DECIMAL(3,2) NOT NULL,
  completion_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual question responses
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_assessment_id UUID REFERENCES category_assessments(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  response_value TEXT,
  response_type VARCHAR(20) NOT NULL,
  question_weight DECIMAL(5,2) NOT NULL,
  points_earned DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment recommendations
CREATE TABLE IF NOT EXISTS assessment_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES advanced_fundability_assessments(id) ON DELETE CASCADE,
  category_id VARCHAR(50),
  recommendation_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL, -- high, medium, low
  estimated_impact_points INTEGER,
  estimated_timeframe VARCHAR(50),
  action_items TEXT[],
  resources JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Score history for tracking improvements
CREATE TABLE IF NOT EXISTS score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES advanced_fundability_assessments(id),
  overall_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  assessment_date DATE NOT NULL,
  score_change INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated reports table
CREATE TABLE IF NOT EXISTS assessment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES advanced_fundability_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- pdf, summary, detailed
  file_path VARCHAR(500),
  file_size INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  last_downloaded TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE advanced_fundability_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own advanced assessments" ON advanced_fundability_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own advanced assessments" ON advanced_fundability_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own category assessments" ON category_assessments
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM advanced_fundability_assessments WHERE id = assessment_id
  ));

CREATE POLICY "Users can insert category assessments" ON category_assessments
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM advanced_fundability_assessments WHERE id = assessment_id
  ));

CREATE POLICY "Users can view own question responses" ON question_responses
  FOR SELECT USING (auth.uid() IN (
    SELECT afa.user_id FROM advanced_fundability_assessments afa
    JOIN category_assessments ca ON afa.id = ca.assessment_id
    WHERE ca.id = category_assessment_id
  ));

CREATE POLICY "Users can insert question responses" ON question_responses
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT afa.user_id FROM advanced_fundability_assessments afa
    JOIN category_assessments ca ON afa.id = ca.assessment_id
    WHERE ca.id = category_assessment_id
  ));

CREATE POLICY "Users can view own recommendations" ON assessment_recommendations
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM advanced_fundability_assessments WHERE id = assessment_id
  ));

CREATE POLICY "Users can view own score history" ON score_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON assessment_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_advanced_assessments_user_date ON advanced_fundability_assessments(user_id, assessment_date);
CREATE INDEX idx_category_assessments_assessment ON category_assessments(assessment_id);
CREATE INDEX idx_question_responses_category ON question_responses(category_assessment_id);
CREATE INDEX idx_recommendations_assessment ON assessment_recommendations(assessment_id);
CREATE INDEX idx_score_history_user_date ON score_history(user_id, assessment_date);
CREATE INDEX idx_reports_assessment ON assessment_reports(assessment_id);

-- Sample data for testing
INSERT INTO advanced_fundability_assessments (user_id, overall_score, completion_time_minutes)
SELECT id, 85, 25 FROM auth.users WHERE email = 'demo@ybwfunds.com' LIMIT 1;