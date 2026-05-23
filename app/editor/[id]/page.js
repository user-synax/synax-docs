'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import TopBar from '@/components/editor/TopBar';
import EditorCore from '@/components/editor/EditorCore';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditorPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { setDocument } = useEditorStore();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch(`/api/documents/${id}`);
        if (!response.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await response.json();
        setDoc(data);
        setDocument(data._id, data.title);
      } catch (error) {
        console.error('Fetch Error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoc();
    }
  }, [id, router, setDocument]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-zinc-950">
        <div className="h-[52px] border-b border-zinc-800 flex items-center px-4 gap-4">
          <Skeleton className="w-8 h-8 rounded-lg bg-zinc-900" />
          <Skeleton className="w-48 h-6 rounded bg-zinc-900" />
        </div>
        <div className="h-[44px] border-b border-zinc-800 bg-zinc-900 flex items-center px-4 gap-4">
          <Skeleton className="w-full h-6 rounded bg-zinc-800" />
        </div>
        <div className="flex-1 max-w-[800px] mx-auto w-full py-[80px] px-[40px] space-y-6">
          <Skeleton className="w-full h-12 bg-zinc-900 rounded" />
          <Skeleton className="w-3/4 h-6 bg-zinc-900 rounded" />
          <Skeleton className="w-full h-6 bg-zinc-900 rounded" />
          <Skeleton className="w-5/6 h-6 bg-zinc-900 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <TopBar editor={editor} />
      <div className="flex-1 flex flex-col pt-[52px]">
        <EditorCore 
          initialContent={doc?.content} 
          documentId={id} 
          onEditorReady={setEditor}
        />
      </div>
    </div>
  );
}
