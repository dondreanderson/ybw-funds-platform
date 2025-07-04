import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiScoringEngine, type AssessmentData } from '@/lib/ai-scoring-engine';

export async function POST(request: NextRequest) {
  try {
    const assessmentData: AssessmentData = await request.json();

    // Validate required fields
    if (!assessmentData.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Calculate AI-driven fundability score
    const scoringResult = await aiScoringEngine.calculateFundabilityScore(assessmentData);

    // Save to database
    const { data: assessment, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .insert({
        user_id: assessmentData.userId,
        overall_score: Math.round(scoringResult.percentage),
        category_scores: scoringResult.categoryScores.reduce((acc, cat) => {
          acc[cat.category.toLowerCase().replace(/\s+/g, '_')] = Math.round(cat.percentage);
          return acc;
        }, {} as Record<string, number>),
        completion_percentage: 100,
        assessment_version: '3.0',
        status: 'completed',
        recommendations: scoringResult.recommendations,
        improvement_areas: scoringResult.recommendations
          .filter(r => r.priority === 'critical' || r.priority === 'high')
          .map(r => r.title),
        strengths: scoringResult.categoryScores
          .filter(c => c.percentage >= 80)
          .map(c => c.category),
        metadata: {
          fundabilityGrade: scoringResult.fundabilityGrade,
          improvementPotential: scoringResult.improvementPotential,
          assessmentType: 'ai_driven',
          businessType: assessmentData.businessType,
          industry: assessmentData.industry
        }
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Save category performances
    const categoryInserts = scoringResult.categoryScores.map((cat, index) => ({
      assessment_id: assessment.id,
      category_id: `cat_${index + 1}`,
      category_name: cat.category,
      score: Math.round(cat.percentage),
      max_score: 100,
      completed_criteria: cat.completedCriteria,
      total_criteria: cat.totalCriteria,
      answers: assessmentData.responses
    }));

    const { error: categoryError } = await supabase
      .from('category_performances')
      .insert(categoryInserts);

    if (categoryError) {
      console.error('Error saving categories:', categoryError);
      // Continue despite category error
    }

    // Save to score history
    const { error: historyError } = await supabase
      .from('score_history')
      .insert({
        user_id: assessmentData.userId,
        assessment_id: assessment.id,
        overall_score: Math.round(scoringResult.percentage),
        category_scores: scoringResult.categoryScores.reduce((acc, cat) => {
          acc[cat.category] = Math.round(cat.percentage);
          return acc;
        }, {} as Record<string, number>),
        assessment_date: new Date().toISOString().split('T')[0],
        score_change: 0 // Calculate from previous assessment
      });

    if (historyError) {
      console.error('Error saving history:', historyError);
      // Continue despite history error
    }

    // Update user's fundability score
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        fundability_score: Math.round(scoringResult.percentage),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentData.userId);

    if (userError) {
      console.error('Error updating user score:', userError);
      // Continue despite user update error
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        ...scoringResult,
        savedAt: assessment.created_at
      }
    });

  } catch (error) {
    console.error('Error calculating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to calculate assessment' },
      { status: 500 }
    );
  }
}
