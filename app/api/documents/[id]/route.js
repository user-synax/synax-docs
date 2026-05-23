import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'viewer');
    
    if (!allowed) {
      if (!userId) return new Response('Unauthorized', { status: 401 });
      return new Response(message || 'Forbidden', { status: status || 403 });
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

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'editor');
    
    if (!allowed) {
      if (!userId) return new Response('Unauthorized', { status: 401 });
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    const update = { ...body, lastEditedAt: new Date() };
    
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    return Response.json(updatedDocument);
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

    // Only owner can delete
    const document = await Document.findById(id);
    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    if (document.ownerId !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    if (permanent) {
      await Document.deleteOne({ _id: id });
    } else {
      await Document.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('DELETE_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
