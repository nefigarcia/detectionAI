import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const S3_BUCKET = process.env.S3_BUCKET;
if (!S3_BUCKET) {
  console.warn('S3_BUCKET not set — image uploads will fail until S3_BUCKET is configured');
}

// Determine region: if S3_REGION is set use it; if a custom S3_ENDPOINT is set but
// no region provided, default to 'us-east-1' which works for many S3-compatible
// endpoints. This avoids "Region is missing" errors from the AWS SDK.
const s3Region = process.env.S3_REGION || (process.env.S3_ENDPOINT ? 'us-east-1' : undefined);
if (!s3Region) {
  console.warn('S3_REGION not set and no S3_ENDPOINT detected — S3 client may fail for some providers');
}

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: s3Region,
  credentials: process.env.S3_KEY
    ? { accessKeyId: process.env.S3_KEY as string, secretAccessKey: process.env.S3_SECRET as string }
    : undefined,
});

async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  const params: any = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: file,
    ContentType: contentType || 'application/octet-stream',
  };

  // If you want objects to be publicly readable, set ACL here. Keep private by default.
  // params.ACL = 'private';

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return fileName;
}

function publicUrlForKey(key: string) {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const bucket = S3_BUCKET;

  if (!bucket) return `s3://${bucket}/${key}`;

  if (endpoint) {
    // Normalize endpoint (no trailing slash)
    const e = endpoint.replace(/\/$/, '');
    return `${e}/${bucket}/${key}`;
  }

  // Default AWS S3 virtual-hosted style URL
  if (!region || region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const projectIdString = formData.get('projectId') as string | null;
    const uploadedByString = formData.get('uploadedBy') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }
    if (!projectIdString) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    let projectId = parseInt(projectIdString, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    // Optionally check project exists. If not, create a default company and project
    // so uploads from the UI (which currently hardcode projectId=1) will succeed
    // in fresh/dev databases.
    let project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      console.info(`Project ${projectId} not found — creating fallback company+project for upload`);
      // Find any existing company to attach the project to
      let company = await prisma.company.findFirst();
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: 'Default Company',
            slug: 'default-company',
          },
        });
        console.info(`Created default company id=${company.id}`);
      }
      project = await prisma.project.create({
        data: {
          companyId: company.id,
          name: `Default Project ${company.id}`,
          description: 'Auto-created project for uploads',
        },
      });
      console.info(`Created fallback project id=${project.id} for company id=${company.id}`);
      // ensure we use the newly created project's id for the image record
      projectId = project.id;
    }

    // Basic validation
    const MAX_BYTES = Number(process.env.IMAGE_MAX_BYTES ?? 10 * 1024 * 1024); // 10MB default
    const allowedTypes = (process.env.IMAGE_ALLOWED_TYPES ?? 'image/jpeg,image/png,image/webp').split(',');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: `File too large (max ${MAX_BYTES} bytes)` }, { status: 400 });
    }
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : `upload`;
    const unique = crypto.randomUUID();
    const key = `projects/${projectId}/uploads/${Date.now()}-${unique}-${safeName}`;

    // Upload to S3
    await uploadFileToS3(buffer, key, file.type || 'application/octet-stream');

    const publicUrl = publicUrlForKey(key);

    const newImage = await prisma.image.create({
      data: {
        projectId: projectId,
        originalUrl: publicUrl,
        filename: file.name,
        size: buffer.byteLength,
        mimetype: file.type || 'application/octet-stream',
        uploadedBy: uploadedByString ? parseInt(uploadedByString, 10) : undefined,
      },
    });

    return NextResponse.json({ ok: true, image: newImage, s3Key: key, publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

