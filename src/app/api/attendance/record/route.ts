import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

// POST — Record attendance via RFID scan
export const POST = withCors(async (request: NextRequest) => {
  try {
    const { location, course_code, metadata } = await request.json();
    if (!location) {
      return NextResponse.json({ message: 'Location (classroom) is required' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.from('rfid_scans').insert({
      student_id: user.id,
      location,
      event_type: 'attendance',
      metadata: {
        course_code: course_code || null,
        ...(metadata || {}),
      },
    });
    if (error) {
      console.error('Attendance record error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Attendance recorded' }, { status: 201 });
  } catch (e) {
    console.error('Attendance route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});

// GET — Fetch attendance history for the current user
export const GET = withCors(async (request: NextRequest) => {
  try {
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rfid_scans')
      .select('id, location, scanned_at, metadata')
      .eq('student_id', user.id)
      .eq('event_type', 'attendance')
      .order('scanned_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Attendance fetch error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ attendance: data }, { status: 200 });
  } catch (e) {
    console.error('Attendance GET exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
