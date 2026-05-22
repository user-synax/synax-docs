'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import Toolbar from './Toolbar';
import useAutoSave from '@/hooks/useAutoSave';

const lowlight = createLowlight(common);

export default function EditorCore({ initialContent, documentId }) {
  const { updateCounts } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use lowlight instead
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      FontFamily,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Blockquote,
      HorizontalRule,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-invert max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const words = editor.storage.characterCount.words();
      const characters = editor.storage.characterCount.characters();
      updateCounts(words, characters);
    },
  });

  const { saveContent } = useAutoSave(editor, documentId);

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveContent]);

  return (
    <div className="flex flex-col flex-1">
      <Toolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="max-w-[800px] border border-zinc-800 mx-auto py-[80px] px-[40px] my-[20px]">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      {/* Word count footer */}
      <div className="h-6 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-end gap-4 fixed bottom-0 left-0 right-0 z-10">
        <span className="text-[10px] text-zinc-500 font-medium">
          {editor?.storage.characterCount.words()} words
        </span>
        <span className="text-[10px] text-zinc-500 font-medium">
          {editor?.storage.characterCount.characters()} characters
        </span>
      </div>
    </div>
  );
}
