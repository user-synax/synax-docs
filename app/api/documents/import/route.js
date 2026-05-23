import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import { htmlToTiptap } from '@/lib/editor/tiptapToHtml';
import mammoth from 'mammoth';
import { marked } from 'marked';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    const filename = file.name;
    const extension = filename.split('.').pop().toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let html = '';
    let title = filename.split('.').slice(0, -1).join('.') || 'Imported Document';

    switch (extension) {
      case 'docx': {
        const result = await mammoth.convertToHtml({ buffer });
        html = result.value;
        break;
      }
      case 'md':
      case 'markdown': {
        const markdown = buffer.toString('utf8');
        html = await marked.parse(markdown);
        break;
      }
      case 'txt': {
        const text = buffer.toString('utf8');
        html = text.split('\n').map(line => `<p>${line}</p>`).join('');
        break;
      }
      default:
        return new Response('Unsupported file type', { status: 400 });
    }

    const content = htmlToTiptap(html);

    await connectDB();

    const document = await Document.create({
      title,
      content,
      ownerId: userId,
    });

    return Response.json({ id: document._id });
  } catch (error) {
    console.error('IMPORT_ERROR', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
