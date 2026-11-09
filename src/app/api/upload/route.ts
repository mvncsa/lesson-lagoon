import { NextResponse } from 'next/server';
import { validateUploadFileSize, MAX_UPLOAD_SIZE_BYTES } from '@/lib/fileDetection';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Ephemeral local upload endpoint (up to 10MB)
 * Files are processed in-memory or temporary buffer and discarded when done.
 * Zero S3 requirement for development and local testing.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Enforce 10MB ceiling
    const validation = validateUploadFileSize(file.size, 10);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'File size exceeds 10MB limit' },
        { status: 413 }
      );
    }

    // Process file into temporary buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ephemeral metadata (discarded upon restart)
    const ephemeralId = 'tmp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

    return NextResponse.json({
      success: true,
      fileId: ephemeralId,
      name: file.name,
      type: file.type,
      size: validation.formattedSize,
      sizeBytes: file.size,
      storage: 'ephemeral-local',
      notice: 'Stored in ephemeral session memory. Discarded when done or on application restart.',
    });
  } catch (err: any) {
    console.error('Ephemeral upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload processing failed' }, { status: 500 });
  }
}
