import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_KEY as string,
    secretAccessKey: process.env.S3_SECRET as string,
  },
});

async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return fileName;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const projectIdString = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }
    if (!projectIdString) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    const projectId = parseInt(projectIdString, 10);
    if(isNaN(projectId)) {
        return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `projects/${projectId}/uploads/${Date.now()}-${file.name}`;

    await uploadFileToS3(buffer, key, file.type);

    const newImage = await prisma.image.create({
      data: {
        projectId: projectId,
        originalUrl: `s3://${process.env.S3_BUCKET}/${key}`,
        filename: file.name,
        size: file.size,
        mimetype: file.type,
      },
    });

    return NextResponse.json({ ok: true, image: newImage, s3Key: key });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
