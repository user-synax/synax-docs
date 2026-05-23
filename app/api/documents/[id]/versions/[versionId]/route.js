import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import Version from '@/models/Version';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { versionId } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const version = await Version.findById(versionId).lean();
    if (!version) {
      return new Response('Not Found', { status: 404 });
    }

    return Response.json(version);
  } catch (error) {
    console.error('GET_SINGLE_VERSION_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
