import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/connect';
import Document from '@/models/Document';
import { checkDocumentAccess } from '@/lib/auth/documentAccess';
import { tiptapToHtml } from '@/lib/editor/tiptapToHtml';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import TurndownService from 'turndown';
import pdfMakeModule from "pdfmake/build/pdfmake";
import pdfFontsModule from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import { JSDOM } from "jsdom";

const pdfMake = pdfMakeModule.default || pdfMakeModule;
const pdfFonts = pdfFontsModule.default || pdfFontsModule;

// Safely assign vfs fonts
try {
  if (typeof pdfFonts === 'function') {
    pdfFonts(pdfMake);
  } else if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  } else if (pdfFonts) {
    pdfMake.vfs = pdfFonts;
  }
} catch (e) {
  console.error("[Export] Failed to initialize pdfMake vfs:", e);
}

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'txt';

    console.log(`[Export] Starting export for doc ${id}, format ${format}, user ${userId}`);
    console.log(`[Export] pdfMake vfs status: ${!!pdfMake.vfs}`);

    const { allowed, document, status, message } = await checkDocumentAccess(id, userId, 'viewer');
    
    if (!allowed) {
      console.log(`[Export] Access denied for doc ${id}: ${message}`);
      if (!userId) return new Response('Unauthorized', { status: 401 });
      return new Response(message || 'Forbidden', { status: status || 403 });
    }

    console.log(`[Export] Access granted for doc ${id}`);

    const html = tiptapToHtml(document.content || { type: 'doc', content: [] });
    const title = document.title || 'Untitled Document';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (!document.content || Object.keys(document.content).length === 0) {
      // If no content, just return a basic text response for now to avoid library crashes
      if (format === 'txt' || format === 'markdown') {
        return new Response('', {
          headers: {
            'Content-Type': format === 'txt' ? 'text/plain' : 'text/markdown',
            'Content-Disposition': `attachment; filename="${safeTitle}.${format === 'txt' ? 'txt' : 'md'}"`,
          },
        });
      }
    }

    switch (format) {
      case 'pdf': {
        console.log(`[Export] Generating PDF for doc ${id}`);
        const dom = new JSDOM(html);
        const pdfContent = htmlToPdfmake(html, { window: dom.window });
        const docDefinition = {
          content: [
            { text: title, style: 'header' },
            ...pdfContent
          ],
          styles: {
            header: { fontSize: 22, bold: true, marginBottom: 20 }
          }
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);
        const buffer = await new Promise((resolve, reject) => {
          pdfDoc.getBuffer((data) => resolve(data), (err) => reject(err));
        });

        console.log(`[Export] PDF generated for doc ${id}`);
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
          },
        });
      }

      case 'docx': {
        console.log(`[Export] Generating DOCX for doc ${id}`);
        // Very basic DOCX conversion for now
        const docx = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: title,
                heading: HeadingLevel.TITLE,
              }),
              ...(document.content?.content || []).map(node => {
                if (node.type === 'paragraph') {
                  return new Paragraph({
                    children: node.content?.map(textNode => new TextRun({
                      text: textNode.text || '',
                      bold: textNode.marks?.some(m => m.type === 'bold'),
                      italics: textNode.marks?.some(m => m.type === 'italic'),
                    })) || [],
                  });
                }
                if (node.type === 'heading') {
                  return new Paragraph({
                    text: node.content?.[0]?.text || '',
                    heading: node.attrs?.level === 1 ? HeadingLevel.HEADING_1 : 
                             node.attrs?.level === 2 ? HeadingLevel.HEADING_2 : 
                             HeadingLevel.HEADING_3,
                  });
                }
                return new Paragraph({ text: '' });
              })
            ],
          }],
        });

        const buffer = await Packer.toBuffer(docx);
        console.log(`[Export] DOCX generated for doc ${id}`);
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
          },
        });
      }

      case 'markdown': {
        const turndown = new TurndownService();
        const markdown = turndown.turndown(html);
        return new Response(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${safeTitle}.md"`,
          },
        });
      }

      case 'txt': {
        const text = html.replace(/<[^>]*>/g, '');
        return new Response(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${safeTitle}.txt"`,
          },
        });
      }

      default:
        return new Response('Unsupported Format', { status: 400 });
    }
  } catch (error) {
    console.error('EXPORT_ERROR', error);
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }
}
