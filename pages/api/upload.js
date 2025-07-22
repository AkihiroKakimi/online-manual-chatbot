import { put } from '@vercel/blob';

export default async function handler(request, response) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'upload.pdf';
    
    // Blobストレージにアップロード
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return response.status(200).json(blob);
  } catch (error) {
    console.error('Blob upload error:', error);
    return response.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: false, // Blobアップロードのため無効化
  },
};