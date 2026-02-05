import { NextResponse } from 'next/server';
import { defectMetrics } from '@/lib/data';

export async function GET() {
  // For now return the in-repo mock metrics so the UI can show data for authenticated users.
  try {
    return NextResponse.json(defectMetrics);
  } catch (err) {
    console.error('GET /api/dashboard/metrics error', err);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
