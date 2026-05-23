import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import User from '@/models/User';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';

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

    // Include owner in the list for the UI
    const owner = await User.findOne({ clerkId: document.ownerId }).lean();

    return Response.json({
      collaborators: document.collaborators,
      owner: owner ? {
        clerkId: owner.clerkId,
        email: owner.email,
        name: owner.name,
        avatarUrl: owner.avatarUrl
      } : null
    });
  } catch (error) {
    console.error('GET_COLLABORATORS_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { email, role } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'editor');
    
    if (!allowed) {
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    await connectDB();

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return new Response(JSON.stringify({ message: "No account found with this email." }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already a collaborator or owner
    if (userToAdd.clerkId === document.ownerId) {
      return new Response(JSON.stringify({ message: "User is the owner of this document." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingCollab = document.collaborators.find(c => c.userId === userToAdd.clerkId);
    if (existingCollab) {
      return new Response(JSON.stringify({ message: "User is already a collaborator." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    document.collaborators.push({
      userId: userToAdd.clerkId,
      email: userToAdd.email,
      role: role || 'viewer',
      addedAt: new Date()
    });

    await document.save();

    return Response.json(document);
  } catch (error) {
    console.error('POST_COLLABORATOR_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { userId: userIdToRemove } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();
    const document = await Document.findById(id);

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    // Only owner can remove collaborators
    if (document.ownerId !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    document.collaborators = document.collaborators.filter(c => c.userId !== userIdToRemove);
    await document.save();

    return Response.json(document);
  } catch (error) {
    console.error('DELETE_COLLABORATOR_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { userId: userIdToUpdate, role } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();
    const document = await Document.findById(id);

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    // Only owner can change collaborator roles
    if (document.ownerId !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    const collaborator = document.collaborators.find(c => c.userId === userIdToUpdate);
    if (!collaborator) {
      return new Response('Collaborator not found', { status: 404 });
    }

    collaborator.role = role;
    await document.save();

    return Response.json(document);
  } catch (error) {
    console.error('PATCH_COLLABORATOR_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
