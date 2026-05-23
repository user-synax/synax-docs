import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import Version from '@/models/Version';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { id, versionId } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'editor');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    const version = await Version.findById(versionId);
    if (!version) {
      return new Response('Version Not Found', { status: 404 });
    }

    // 1. Create a snapshot of current state before restore
    await Version.create({
      documentId: id,
      content: document.content,
      savedBy: userId,
      label: "Before restore",
    });

    // 2. Restore content
    document.content = version.content;
    document.lastEditedAt = new Date();
    await document.save();

    return Response.json(document);
  } catch (error) {
    console.error('RESTORE_VERSION_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
