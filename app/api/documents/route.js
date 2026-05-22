import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const starred = searchParams.get('starred') === 'true';
    const trash = searchParams.get('trash') === 'true';

    await connectDB();

    let query = {
      ownerId: userId,
      deletedAt: trash ? { $ne: null } : null,
    };

    if (starred) {
      query.isStarred = true;
    }

    if (q) {
      query.$text = { $search: q };
    }

    const documents = await Document.find(query)
      .sort({ lastEditedAt: -1 })
      .lean();

    return Response.json(documents);
  } catch (error) {
    console.error('GET_DOCUMENTS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const document = await Document.create({
      ownerId: userId,
    });

    return Response.json({ id: document._id });
  } catch (error) {
    console.error('POST_DOCUMENTS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
