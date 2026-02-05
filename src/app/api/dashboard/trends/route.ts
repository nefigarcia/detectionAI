import { NextResponse } from 'next/server';
import { defectTrends } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json(defectTrends);
  } catch (err) {
    console.error('GET /api/dashboard/trends error', err);
    return NextResponse.json({ error: 'Failed to load trends' }, { status: 500 });
  }
}
