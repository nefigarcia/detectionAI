import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { NextRequest } from 'next/server';

function parseBucketAndKeyFromUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    const pathname = url.pathname || '';

    const envBucket = process.env.S3_BUCKET;
    if (envBucket) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length && parts[0] === envBucket) {
        parts.shift();
        return { bucket: envBucket, key: parts.join('/') };
      }
      return { bucket: envBucket, key: pathname.replace(/^\/+/, '') };
    }

    const hostParts = hostname.split('.');
    if (hostParts.length > 3 && hostParts[1] === 's3') {
      const bucket = hostParts[0];
      const key = pathname.replace(/^\/+/, '');
      return { bucket, key };
    }

    if (hostParts[0].startsWith('s3')) {
      const parts = pathname.split('/').filter(Boolean);
      const bucket = parts.shift();
      const key = parts.join('/');
      return { bucket: bucket ?? '', key };
    }

    const parts = pathname.split('/').filter(Boolean);
    const bucket = parts.shift();
    const key = parts.join('/');
    return { bucket: bucket ?? '', key };
  } catch (err) {
    return { bucket: process.env.S3_BUCKET ?? '', key: '' };
  }
}

export async function GET(request: NextRequest, context: any) {
  try {
    let params: any = context?.params;
    if (params && typeof params.then === 'function') params = await params;
    const idStr = params?.id;
    const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    const originalUrl = image.originalUrl;
    const { bucket, key } = parseBucketAndKeyFromUrl(originalUrl);
    if (!bucket || !key) return NextResponse.json({ error: 'Could not determine S3 key' }, { status: 500 });

    const s3Region = process.env.S3_REGION || (process.env.S3_ENDPOINT ? 'us-east-1' : undefined);
    const s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || undefined,
      region: s3Region,
      credentials: process.env.S3_KEY
        ? { accessKeyId: process.env.S3_KEY as string, secretAccessKey: process.env.S3_SECRET as string }
        : undefined,
    });

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const s3Res = await s3Client.send(command);
    const body = s3Res.Body as any;
    const headers: Record<string, string> = {};
    if (s3Res.ContentType) headers['Content-Type'] = s3Res.ContentType;
    if (s3Res.CacheControl) headers['Cache-Control'] = s3Res.CacheControl;

    return new Response(body as any, { headers });
  } catch (err) {
    console.error('GET /api/images/[id]/proxy error', err);
    const msg = err instanceof Error ? err.message : 'Failed to proxy image';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
