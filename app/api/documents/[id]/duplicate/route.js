import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';
import crypto from 'crypto';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, document: originalDoc, status, message } = await checkDocumentAccess(id, userId, 'viewer');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    const newDoc = await Document.create({
      title: `Copy of ${originalDoc.title}`,
      content: originalDoc.content,
      ownerId: userId,
      collaborators: [],
      shareMode: 'private',
      shareToken: crypto.randomBytes(16).toString('hex'),
      isStarred: false,
      deletedAt: null,
      lastEditedAt: new Date(),
      createdAt: new Date(),
    });

    return Response.json({ id: newDoc._id });
  } catch (error) {
    console.error('DUPLICATE_DOCUMENT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
