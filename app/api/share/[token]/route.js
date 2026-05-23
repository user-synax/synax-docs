import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';

export async function GET(req, { params }) {
  try {
    const { token } = await params;

    await connectDB();

    const document = await Document.findOne({ shareToken: token }).lean();

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    if (document.shareMode === 'private') {
      return new Response('Forbidden', { status: 403 });
    }

    // Return limited document info for public access
    return Response.json({
      title: document.title,
      content: document.content,
      shareMode: document.shareMode,
      id: document._id
    });
  } catch (error) {
    console.error('GET_PUBLIC_SHARE_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
