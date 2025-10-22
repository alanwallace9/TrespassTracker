import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Supabase client with service role key (bypasses RLS for admin operations)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron job to reset demo tenant data every hour
 *
 * This endpoint should be called by Vercel Cron or similar service
 * URL: /api/cron/reset-demo
 * Schedule: 0 * * * * (every hour)
 *
 * Security: Verifies cron secret to prevent unauthorized access
 */
export async function GET(req: NextRequest) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error('CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('Starting demo tenant reset');

    // Step 1: Delete all demo tenant records
    const { error: deleteError } = await supabaseAdmin
      .from('trespass_records')
      .delete()
      .eq('tenant_id', 'demo');

    if (deleteError) {
      logger.error('Error deleting demo records', deleteError);
      throw deleteError;
    }

    // Step 2: Insert fresh seed data
    const seedData = getDemoSeedData();
    const { error: insertError } = await supabaseAdmin
      .from('trespass_records')
      .insert(seedData);

    if (insertError) {
      logger.error('Error inserting demo seed data', insertError);
      throw insertError;
    }

    logger.info('Demo tenant reset completed successfully', {
      deletedRecords: 'all',
      insertedRecords: seedData.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Demo tenant reset successfully',
      recordsInserted: seedData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error resetting demo tenant', error);
    return NextResponse.json(
      {
        error: 'Failed to reset demo tenant',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get demo seed data for reset
 * These records will be inserted after each reset
 */
function getDemoSeedData() {
  const demoAdminUserId = 'demo-admin-user-id'; // TODO: Replace with actual Clerk user ID
  const demoViewerUserId = 'demo-viewer-user-id'; // TODO: Replace with actual Clerk user ID

  const today = new Date();
  const daysFromNow = (days: number): string => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };
  const daysAgo = (days: number): string => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  return [
    // 1. Active record - Recent trespass
    {
      user_id: demoAdminUserId,
      tenant_id: 'demo',
      first_name: 'John',
      last_name: 'Doe',
      aka: 'JD',
      date_of_birth: '2005-03-15',
      school_id: 'STU123456',
      known_associates: 'Mike Smith, Sarah Johnson',
      current_school: 'N/A',
      guardian_first_name: 'Robert',
      guardian_last_name: 'Doe',
      guardian_phone: '555-0123',
      contact_info: 'robert.doe@email.com',
      incident_date: daysAgo(10),
      location: 'Lincoln High School - Main Entrance',
      description:
        'Individual found on campus after hours without authorization. Refused to leave when asked by security.',
      notes: 'Has been warned previously. Security footage captured.',
      photo_url: null,
      status: 'active',
      is_former_student: false,
      expiration_date: daysFromNow(355), // Active for ~1 year
      trespassed_from: 'All Lincoln High School campuses',
    },

    // 2. Active - Former student
    {
      user_id: demoAdminUserId,
      tenant_id: 'demo',
      first_name: 'Marcus',
      last_name: 'Thompson',
      aka: 'Marc',
      date_of_birth: '2004-11-30',
      school_id: 'STU987654',
      known_associates: 'Trevor Williams (current student)',
      current_school: 'N/A - Graduated 2023',
      guardian_first_name: 'James',
      guardian_last_name: 'Thompson',
      guardian_phone: '555-0789',
      contact_info: 'j.thompson@email.com',
      incident_date: daysAgo(5),
      location: 'Roosevelt High School - Athletic Field',
      description:
        'Former student found on campus attempting to meet with current students. Previously expelled for disciplinary issues.',
      notes:
        'Was expelled in junior year. Known to have conflicts with current staff. Police were called.',
      photo_url: null,
      status: 'active',
      is_former_student: true,
      expiration_date: daysFromNow(725), // Active for ~2 years
      trespassed_from: 'All district facilities',
    },

    // 3. Expired record - For testing inactive status
    {
      user_id: demoViewerUserId,
      tenant_id: 'demo',
      first_name: 'Emily',
      last_name: 'Rodriguez',
      aka: null,
      date_of_birth: '2003-08-22',
      school_id: 'STU555888',
      known_associates: null,
      current_school: 'N/A',
      guardian_first_name: 'Maria',
      guardian_last_name: 'Rodriguez',
      guardian_phone: '555-0456',
      contact_info: 'maria.r@email.com',
      incident_date: daysAgo(400),
      location: 'Washington Middle School - Parking Lot',
      description:
        'Found loitering in parking lot during school hours. No legitimate reason for being on campus.',
      notes: 'Cooperative with staff. Left without incident.',
      photo_url: null,
      status: 'active',
      is_former_student: false,
      expiration_date: daysAgo(35), // Expired 35 days ago
      trespassed_from: 'Washington Middle School',
    },

    // 4. Active - Minimal information
    {
      user_id: demoAdminUserId,
      tenant_id: 'demo',
      first_name: 'Sarah',
      last_name: 'Williams',
      aka: null,
      date_of_birth: null,
      school_id: 'UNKNOWN',
      known_associates: null,
      current_school: null,
      guardian_first_name: null,
      guardian_last_name: null,
      guardian_phone: null,
      contact_info: null,
      incident_date: daysAgo(2),
      location: 'Jefferson Elementary - Front Office',
      description: 'Attempted to gain unauthorized access to school records.',
      notes: null,
      photo_url: null,
      status: 'active',
      is_former_student: false,
      expiration_date: daysFromNow(180), // 6 months
      trespassed_from: 'Jefferson Elementary School',
    },

    // 5. Active - Multiple associates
    {
      user_id: demoViewerUserId,
      tenant_id: 'demo',
      first_name: 'David',
      last_name: 'Chen',
      aka: 'Dave',
      date_of_birth: '2006-05-18',
      school_id: 'STU334455',
      known_associates: 'Kevin Zhang, Lisa Park, Tommy Lee',
      current_school: 'Transferred to private school',
      guardian_first_name: 'Wei',
      guardian_last_name: 'Chen',
      guardian_phone: '555-9988',
      contact_info: 'w.chen@email.com',
      incident_date: daysAgo(15),
      location: 'Madison High School - Gymnasium',
      description: 'Participated in unauthorized gathering. Caused disturbance during school event.',
      notes: 'Third incident this year. Escalate to district admin.',
      photo_url: null,
      status: 'active',
      is_former_student: false,
      expiration_date: daysFromNow(540), // 1.5 years
      trespassed_from: 'All district high schools',
    },
  ];
}
