import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';

/**
 * Checks if a user has access to a document.
 * 
 * @param {string} documentId - The ID of the document.
 * @param {string} clerkUserId - The Clerk user ID.
 * @param {string} requiredRole - The required role ("viewer" or "editor").
 * @returns {Promise<{allowed: boolean, document?: any, status?: number, message?: string}>}
 */
export async function checkDocumentAccess(documentId, clerkUserId, requiredRole = 'viewer') {
    await connectDB();

    const document = await Document.findById(documentId);

    if (!document) {
        return { allowed: false, status: 404, message: 'Document not found' };
    }

    // 1. Owner always has access
    if (document.ownerId === clerkUserId) {
        return { allowed: true, document };
    }

    // 2. Check collaborators
    const collaborator = document.collaborators.find(c => c.userId === clerkUserId);
    if (collaborator) {
        if (requiredRole === 'editor' && collaborator.role !== 'editor') {
            return { allowed: false, status: 403, message: 'Editor access required' };
        }
        return { allowed: true, document };
    }

    // 3. Check public access
    if (document.shareMode === 'public-edit') {
        return { allowed: true, document };
    }

    if (document.shareMode === 'public-view') {
        if (requiredRole === 'editor') {
            return { allowed: false, status: 403, message: 'Editor access required' };
        }
        return { allowed: true, document };
    }

    // 4. Private
    return { allowed: false, status: 403, message: 'Private document' };
}
