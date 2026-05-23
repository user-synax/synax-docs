'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, CloudCheck, CloudUpload, AlertCircle, History, Download, FileDown, FileText as FileIcon, FileCode, FileType } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import VersionHistoryPanel from './VersionHistoryPanel';
import ShareDialog from './ShareDialog';
import { toast } from 'sonner';

export default function TopBar({ editor }) {
  const router = useRouter();
  const { documentId, title, setTitle, saveStatus } = useEditorStore();
  const { renameDocument } = useDocumentStore();
  const [localTitle, setLocalTitle] = useState(title);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async (format) => {
    if (!documentId) return;
    setIsExporting(true);
    const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`);
    
    try {
      const response = await fetch(`/api/documents/${documentId}/export?format=${format}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}.${format === 'markdown' ? 'md' : format === 'docx' ? 'docx' : format === 'pdf' ? 'pdf' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document exported successfully', { id: toastId });
    } catch (error) {
      console.error('Export Error:', error);
      toast.error(`Export failed: ${error.message}`, { id: toastId });
    } finally {
      setIsExporting(false);
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

        <div className="flex items-center gap-2 flex-1 max-w-[150px] sm:max-w-[400px]">
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Untitled Document"
            className="bg-transparent border-none outline-none text-zinc-50 font-semibold text-sm w-full focus:ring-0 placeholder:text-zinc-600 truncate"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1">
        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">
          synax<span className="text-zinc-500">docs</span>
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
        <div className="hidden sm:block">
          {renderSaveStatus()}
        </div>

        <div className="hidden sm:flex -space-x-2 mr-2">
          {/* Placeholder for collaborator avatars */}
          <div className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-zinc-800">
            JD
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
          onClick={() => setHistoryOpen(true)}
        >
          <History className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isExporting}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
            >
              <Download className={cn("w-4 h-4", isExporting && "animate-pulse")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 w-48">
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer">
              <FileDown className="w-4 h-4" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer">
              <FileIcon className="w-4 h-4" /> Export as Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('markdown')} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer">
              <FileCode className="w-4 h-4" /> Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('txt')} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer">
              <FileType className="w-4 h-4" /> Export as Plain Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={() => setShareOpen(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700 h-8 gap-2 rounded-lg px-2 md:px-3"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Share</span>
        </Button>

        <ShareDialog 
          isOpen={shareOpen} 
          onClose={() => setShareOpen(false)} 
          documentId={documentId} 
        />

        <VersionHistoryPanel 
          open={historyOpen} 
          onOpenChange={setHistoryOpen} 
          editor={editor}
        />
      </div>
    </header>
  );
}
