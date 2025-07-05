import { createClient } from '@supabase/supabase-js'; 

const supabase = createClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
); 

export async function POST(request: NextRequest) { 
    try { 
        const assessmentData = await request.json(); // Insert into existing advanced_fundability_assessments table 
        const { data: assessment, error } = await supabase 
        .from('advanced_fundability_assessments') 
        .insert({ user_id: assessmentData.user_id, 
            overall_score: assessmentData.overall_score, 
            category_scores: assessmentData.category_scores, 
            completion_percentage: assessmentData.completion_percentage, 
            recommendations: assessmentData.recommendations, 
            improvement_areas: assessmentData.improvement_areas, 
            strengths: assessmentData.strengths, 
            industry_comparison: assessmentData.industry_comparison, 
            metadata: assessmentData.metadata 
        }) 
        .select() 
        .single(); 
        if (error) throw error; // Save individual criteria responses 
        if (assessmentData.criteriaResponses) { 
            await saveCriteriaResponses(assessment.id, 
                assessmentData.criteriaResponses); 
            } // Generate and save recommendations 
            if (assessmentData.recommendations) { 
                await saveRecommendations(assessment.id, 
                    assessmentData.recommendations); 
                
            } return NextResponse.json({ assessment }); 
        } 
        catch (error) { 
            return NextResponse.json({ 
                error: error.message }, { status: 500 }); 
            } 
        } 