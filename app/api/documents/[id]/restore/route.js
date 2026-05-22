import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const document = await Document.findOneAndUpdate(
      {
        _id: id,
        ownerId: userId
      },
      { $set: { deletedAt: null } },
      { new: true }
    );

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    return Response.json(document);
  } catch (error) {
    console.error('RESTORE_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
