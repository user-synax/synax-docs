import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import Version from '@/models/Version';

export async function POST(req) {
  try {
    // 1. Verify a simple secret to prevent unauthorized calls if needed
    // or rely on Vercel's internal cron security
    
    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find documents to delete
    const docsToDelete = await Document.find({
      deletedAt: { $lt: thirtyDaysAgo, $ne: null }
    }).select('_id');

    const ids = docsToDelete.map(doc => doc._id);

    if (ids.length > 0) {
      // 2. Delete all associated versions
      await Version.deleteMany({ documentId: { $in: ids } });
      
      // 3. Hard delete documents
      const result = await Document.deleteMany({ _id: { $in: ids } });
      
      return Response.json({ 
        message: 'Trash cleanup successful', 
        deletedCount: result.deletedCount 
      });
    }

    return Response.json({ message: 'Nothing to cleanup' });
  } catch (error) {
    console.error('CRON_CLEANUP_TRASH_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
