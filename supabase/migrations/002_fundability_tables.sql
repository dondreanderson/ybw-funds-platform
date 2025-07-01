CREATE TABLE fundability_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL,
  score JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fundability_criteria_history table for tracking changes
CREATE TABLE fundability_criteria_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES fundability_assessments(id) ON DELETE CASCADE,
  criteria_category VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Create fundability_recommendations_tracking table
CREATE TABLE fundability_recommendations_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES fundability_assessments(id) ON DELETE CASCADE,
  recommendation_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, dismissed
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fundability_assessments_user_id ON fundability_assessments(user_id);
CREATE INDEX idx_fundability_assessments_created_at ON fundability_assessments(created_at);
CREATE INDEX idx_fundability_assessments_business_name ON fundability_assessments(business_name);
CREATE INDEX idx_fundability_criteria_history_assessment_id ON fundability_criteria_history(assessment_id);
CREATE INDEX idx_fundability_recommendations_tracking_assessment_id ON fundability_recommendations_tracking(assessment_id);

-- Create RLS policies
ALTER TABLE fundability_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundability_criteria_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundability_recommendations_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for fundability_assessments
CREATE POLICY "Users can view own assessments" ON fundability_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON fundability_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON fundability_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for fundability_criteria_history
CREATE POLICY "Users can view own criteria history" ON fundability_criteria_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fundability_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create criteria history" ON fundability_criteria_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM fundability_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

-- Policy for fundability_recommendations_tracking
CREATE POLICY "Users can manage own recommendation tracking" ON fundability_recommendations_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM fundability_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_fundability_assessments_updated_at 
  BEFORE UPDATE ON fundability_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fundability_recommendations_tracking_updated_at 
  BEFORE UPDATE ON fundability_recommendations_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO fundability_assessments (user_id, business_name, criteria, score, recommendations) VALUES
(
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'Sample Business LLC',
  '{
    "businessStructure": {
      "hasEIN": true,
      "businessType": "LLC",
      "stateOfIncorporation": "California",
      "yearsInBusiness": 3,
      "hasBusinessLicense": true
    },
    "contactInfo": {
      "hasBusinessAddress": true,
      "hasDedicatedBusinessPhone": true,
      "hasBusinessEmail": true,
      "hasBusinessWebsite": true,
      "has411Listing": false
    }
  }',
  '{
    "totalScore": 75,
    "maxScore": 100,
    "percentage": 75,
    "grade": "B",
    "categoryScores": {
      "businessFoundation": 85,
      "contactInfo": 80,
      "banking": 70,
      "credit": 65,
      "legal": 75,
      "financial": 80,
      "digital": 60,
      "industry": 70
    }
  }',
  '[]'
);