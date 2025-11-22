
import { NextResponse } from 'next/server';
import { StorageService } from '@/services/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic validation (optional: check size, type)
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json(
            { error: 'File size too large (max 10MB)' },
            { status: 400 }
        );
    }

    const url = await StorageService.uploadFile(file);

    return NextResponse.json({ url, success: true });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
