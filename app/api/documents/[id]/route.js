import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      $or: [
        { ownerId: userId },
        { 'collaborators.userId': userId }
      ]
    }).lean();

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    return Response.json(document);
  } catch (error) {
    console.error('GET_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const body = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const update = { ...body, lastEditedAt: new Date() };
    
    const document = await Document.findOneAndUpdate(
      {
        _id: id,
        ownerId: userId // Only owner can patch for now (or editors if we check roles)
      },
      { $set: update },
      { new: true }
    );

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    return Response.json(document);
  } catch (error) {
    console.error('PATCH_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    if (permanent) {
      const result = await Document.deleteOne({
        _id: id,
        ownerId: userId
      });
      if (result.deletedCount === 0) {
        return new Response('Not Found', { status: 404 });
      }
    } else {
      const document = await Document.findOneAndUpdate(
        {
          _id: id,
          ownerId: userId
        },
        { $set: { deletedAt: new Date() } },
        { new: true }
      );
      if (!document) {
        return new Response('Not Found', { status: 404 });
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('DELETE_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
