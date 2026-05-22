'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, CloudCheck, CloudUpload, AlertCircle } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function TopBar() {
  const router = useRouter();
  const { documentId, title, setTitle, saveStatus } = useEditorStore();
  const { renameDocument } = useDocumentStore();
  const [localTitle, setLocalTitle] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    if (localTitle.trim() && localTitle !== title) {
      setTitle(localTitle.trim());
      if (documentId) {
        await renameDocument(documentId, localTitle.trim());
      }
    } else {
      setLocalTitle(title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
            <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
            <CloudCheck className="w-3.5 h-3.5" />
            Saved
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Error saving
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
            <CloudCheck className="w-3.5 h-3.5" />
            Up to date
          </div>
        );
    }
  };

  return (
    <header className="h-[52px] border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 max-w-[400px]">
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Untitled Document"
            className="bg-transparent border-none outline-none text-zinc-50 font-semibold text-sm w-full focus:ring-0 placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1">
        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">
          synax<span className="text-zinc-500">docs</span>
        </span>
      </div>

      <div className="flex items-center justify-end gap-4 flex-1">
        {renderSaveStatus()}

        <div className="flex -space-x-2 mr-2">
          {/* Placeholder for collaborator avatars */}
          <div className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-zinc-800">
            JD
          </div>
        </div>

        <Button
          size="sm"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700 h-8 gap-2 rounded-lg"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </header>
  );
}
