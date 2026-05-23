'use client';

import { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { History, RotateCcw, Tag, ChevronRight, Clock } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function VersionHistoryPanel({ open, onOpenChange, editor }) {
  const { documentId } = useEditorStore();
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);

  const fetchVersions = async () => {
    if (!documentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load version history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, documentId]);

  const handleRestore = async (versionId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Restore failed');
      
      const updatedDoc = await response.json();
      editor?.commands.setContent(updatedDoc.content);
      toast.success('Version restored successfully');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to restore version');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950 border-zinc-800 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-violet-500" />
            <SheetTitle className="text-zinc-50">Version History</SheetTitle>
          </div>
          <SheetDescription className="text-zinc-500">
            View and restore previous versions of this document.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Version List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Clock className="w-6 h-6 text-zinc-700 animate-spin" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-10">
                  <History className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No version history yet</p>
                </div>
              ) : (
                versions.map((v) => (
                  <div 
                    key={v._id}
                    className="group relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200">
                          {v.label || "Auto-saved version"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {formatDistanceToNow(new Date(v.createdAt))} ago
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRestore(v._id)}
                        className="h-8 px-2 text-zinc-400 hover:text-violet-400 hover:bg-violet-400/10 gap-2 shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
