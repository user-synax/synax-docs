import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';
import crypto from 'crypto';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'viewer');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    // Ensure shareToken exists
    if (!document.shareToken) {
      document.shareToken = crypto.randomBytes(16).toString('hex');
      await document.save();
    }

    return Response.json({
      shareMode: document.shareMode,
      shareToken: document.shareToken,
    });
  } catch (error) {
    console.error('GET_SHARE_SETTINGS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { shareMode } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();
    const document = await Document.findById(id);

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    // Only owner can change share mode
    if (document.ownerId !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    document.shareMode = shareMode;
    await document.save();

    return Response.json(document);
  } catch (error) {
    console.error('PATCH_SHARE_SETTINGS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
