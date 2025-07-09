// src/app/api/profile/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();
    const userId = session.user.id;

    // Calculate years in business
    const yearsInBusiness = new Date().getFullYear() - profileData.yearsFounded;
    
    // Calculate fundability score based on profile
    let fundabilityScore = 40; // Base score
    
    // Add points for business setup
    if (profileData.hasEIN) fundabilityScore += 10;
    if (profileData.hasDUNS) fundabilityScore += 10;
    if (profileData.hasBusinessBank) fundabilityScore += 10;
    
    // Add points for business age
    if (yearsInBusiness >= 2) fundabilityScore += 10;
    if (yearsInBusiness >= 5) fundabilityScore += 10;
    
    // Add points for revenue
    if (profileData.annualRevenue >= 100000) fundabilityScore += 10;
    if (profileData.annualRevenue >= 500000) fundabilityScore += 10;
    
    // Add points for business structure
    if (['llc', 'corporation'].includes(profileData.businessStructure)) fundabilityScore += 5;

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        business_name: profileData.businessName,
        fundability_score: Math.min(fundabilityScore, 100),
        updated_at: new Date().toISOString()
      });

    // Insert business profile
    const { error: businessError } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: userId,
        business_structure: profileData.businessStructure,
        industry: profileData.industry,
        years_in_business: yearsInBusiness,
        annual_revenue: profileData.annualRevenue,
        employees_count: profileData.employeeCount,
        has_ein: profileData.hasEIN,
        has_duns_number: profileData.hasDUNS,
        has_business_address: profileData.businessAddress.length > 0,
        has_business_phone: profileData.businessPhone.length > 0,
        has_business_website: profileData.businessWebsite.length > 0,
        has_business_email: true, // Assume they have email if they're registered
        updated_at: new Date().toISOString()
      });

    if (profileError || businessError) {
      throw new Error('Database error');
    }

    return NextResponse.json({ 
      success: true, 
      fundabilityScore,
      message: 'Profile completed successfully!' 
    });

  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
