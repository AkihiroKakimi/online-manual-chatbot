import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(request, response) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // ここで認証やバリデーションを追加可能
        return {
          allowedContentTypes: ['application/pdf'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a pathname, etc.
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
        // アップロード完了時の処理
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error('Client upload error:', error);
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export const runtime = 'nodejs';