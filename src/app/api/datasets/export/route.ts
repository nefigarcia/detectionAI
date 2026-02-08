import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

const S3_BUCKET = process.env.S3_BUCKET;
const s3Region = process.env.S3_REGION || (process.env.S3_ENDPOINT ? 'us-east-1' : undefined);

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: s3Region,
  credentials: process.env.S3_KEY
    ? { accessKeyId: process.env.S3_KEY as string, secretAccessKey: process.env.S3_SECRET as string }
    : undefined,
});

async function uploadBufferToS3(buffer: Buffer, key: string, contentType = 'application/octet-stream') {
  if (!S3_BUCKET) throw new Error('S3_BUCKET not configured');
  const cmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: contentType });
  await s3Client.send(cmd);
}

function publicUrlForKey(key: string) {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const bucket = S3_BUCKET;

  if (!bucket) return `s3://${bucket}/${key}`;
  if (endpoint) {
    const e = endpoint.replace(/\/$/, '');
    return `${e}/${bucket}/${key}`;
  }
  if (!region || region === 'us-east-1') return `https://${bucket}.s3.amazonaws.com/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projectId = Number(body.projectId ?? 0);
    const images: Array<any> = body.images || [];
    if (!projectId || images.length === 0) {
      return NextResponse.json({ error: 'projectId and at least one image are required' }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: `Project ${projectId} not found` }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const datasetPrefix = `projects/${projectId}/dataset/`;

    // For each image: fetch bytes (via internal proxy for API images when possible), upload image to dataset/images/, create label file under dataset/labels/
    for (const img of images) {
      const id = img.id;
      const filename = img.filename || `${id}.jpg`;
      const annotations = img.annotations || [];
      const width = Number(img.width || 0);
      const height = Number(img.height || 0);
      if (!width || !height) {
        return NextResponse.json({ error: `Missing width/height for image ${id}. Ensure annotations were saved with image dimensions.` }, { status: 400 });
      }

      // fetch image bytes. Prefer internal proxy if we have numeric id
      let imageBuffer: Buffer | null = null;
      try {
        if (id && String(id).match(/^\d+$/)) {
          const proxyUrl = `${origin}/api/images/${id}/proxy`;
          const resp = await fetch(proxyUrl);
          if (!resp.ok) throw new Error(`Failed to fetch image ${id} from proxy`);
          const ab = await resp.arrayBuffer();
          imageBuffer = Buffer.from(ab);
        } else if (img.originalUrl) {
          const resp = await fetch(img.originalUrl);
          if (!resp.ok) throw new Error(`Failed to fetch image from ${img.originalUrl}`);
          const ab = await resp.arrayBuffer();
          imageBuffer = Buffer.from(ab);
        }
      } catch (e) {
        console.error('Image fetch error', e);
        return NextResponse.json({ error: `Failed to fetch image ${id}: ${(e as Error).message}` }, { status: 500 });
      }

      if (!imageBuffer) continue;

      // upload image to dataset/images/<filename>
      const imageKey = `${datasetPrefix}images/${Date.now()}-${filename}`;
      await uploadBufferToS3(imageBuffer, imageKey, 'image/jpeg');

      // build YOLO label file content. Single-class mapping: defect -> 0
      const lines: string[] = [];
      for (const box of annotations) {
        const x = Number(box.x);
        const y = Number(box.y);
        const w = Number(box.w);
        const h = Number(box.h);
        // convert to normalized center x,y,width,height
        const cx = (x + w / 2) / width;
        const cy = (y + h / 2) / height;
        const nw = w / width;
        const nh = h / height;
        lines.push(`0 ${cx.toFixed(6)} ${cy.toFixed(6)} ${nw.toFixed(6)} ${nh.toFixed(6)}`);
      }
      const labelKey = `${datasetPrefix}labels/${filename.replace(/\.[^/.]+$/, '')}.txt`;
      const labelBuffer = Buffer.from(lines.join('\n'), 'utf-8');
      await uploadBufferToS3(labelBuffer, labelKey, 'text/plain');
    }

    // Create Dataset record in DB and associate images where possible
    const ds = await prisma.dataset.create({
      data: {
        projectId,
        name: `yolo-export-${Date.now()}`,
        status: 'ready',
      },
    });

    // Optionally connect images to dataset when they exist in DB
    const connectIds = images.map((i) => Number(i.id)).filter((n) => !isNaN(n));
    if (connectIds.length > 0) {
      await prisma.image.updateMany({ where: { id: { in: connectIds } }, data: { datasetId: ds.id } });
    }

    return NextResponse.json({ ok: true, dataset: ds, s3Path: datasetPrefix });
  } catch (err) {
    console.error('Dataset export error', err);
    const message = err instanceof Error ? err.message : 'Export error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
