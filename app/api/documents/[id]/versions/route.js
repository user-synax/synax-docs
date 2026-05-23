import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import Version from '@/models/Version';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, status, message } = await checkDocumentAccess(id, userId, 'viewer');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    const versions = await Version.find({ documentId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return Response.json(versions);
  } catch (error) {
    console.error('GET_VERSIONS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { content, label } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, status, message } = await checkDocumentAccess(id, userId, 'editor');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    // Create the version
    const version = await Version.create({
      documentId: id,
      content,
      savedBy: userId,
      label,
    });

    // Handle rolling window of 50 versions
    const versionCount = await Version.countDocuments({ documentId: id });
    if (versionCount > 50) {
      const oldestVersion = await Version.findOne({ documentId: id })
        .sort({ createdAt: 1 });
      if (oldestVersion) {
        await Version.deleteOne({ _id: oldestVersion._id });
      }
    }

    return Response.json(version);
  } catch (error) {
    console.error('POST_VERSION_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
