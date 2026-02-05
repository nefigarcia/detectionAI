import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  try {
    // `context.params` may be a plain object or a Promise depending on runtime — handle both.
    let params: any = context?.params;
    if (params && typeof params.then === 'function') {
      params = await params;
    }

    const idStr = params?.id;
    const projectId = parseInt(Array.isArray(idStr) ? idStr[0] : idStr, 10);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });

    const images = await prisma.image.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(images);
  } catch (err) {
    console.error('GET /api/projects/[id]/images error', err);
    const msg = err instanceof Error ? err.message : 'Failed to fetch images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
