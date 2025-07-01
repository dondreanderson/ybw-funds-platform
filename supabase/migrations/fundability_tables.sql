-- Create fundability_criteria table
CREATE TABLE IF NOT EXISTS fundability_criteria (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    weight INTEGER NOT NULL DEFAULT 1,
    required BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL CHECK (type IN ('boolean', 'text', 'number', 'select')),
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fundability_assessments table
CREATE TABLE IF NOT EXISTS fundability_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    completed_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fundability_criteria_category ON fundability_criteria(category);
CREATE INDEX IF NOT EXISTS idx_fundability_criteria_weight ON fundability_criteria(weight DESC);
CREATE INDEX IF NOT EXISTS idx_fundability_assessments_user_id ON fundability_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_fundability_assessments_updated_at ON fundability_assessments(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE fundability_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundability_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for fundability_criteria (public read access)
CREATE POLICY "Public can read criteria" ON fundability_criteria
    FOR SELECT USING (true);

-- Create policies for fundability_assessments (users can only access their own)
CREATE POLICY "Users can view own assessments" ON fundability_assessments
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own assessments" ON fundability_assessments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own assessments" ON fundability_assessments
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_fundability_criteria_updated_at 
    BEFORE UPDATE ON fundability_criteria 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fundability_assessments_updated_at 
    BEFORE UPDATE ON fundability_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();