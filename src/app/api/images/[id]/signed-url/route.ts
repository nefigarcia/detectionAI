import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

// Lightweight signed-url route fallback: instead of generating an AWS presigned
// URL (which would require an extra dependency), return the app-local proxy
// endpoint which streams the S3 object through the server. The proxy route
// handles authentication/credentials server-side and avoids exposing S3
// credentials to the browser.

export async function GET(request: NextRequest, context: any) {
  try {
    let params: any = context?.params;
    if (params && typeof params.then === 'function') params = await params;
    const idStr = params?.id;
    const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    // Return the local proxy URL which the client can use to retrieve the
    // private S3 object via the app server.
    return NextResponse.json({ url: `/api/images/${id}/proxy` });
  } catch (err) {
    console.error('GET /api/images/[id]/signed-url error', err);
    const msg = err instanceof Error ? err.message : 'Failed to build signed url proxy';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
