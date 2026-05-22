'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Star, 
  FileText, 
  Edit2, 
  Trash2, 
  Undo2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentStore } from '@/store/documentStore';
import { cn } from '@/lib/utils';

export default function DocumentCard({ doc, isTrash = false }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(doc?.title || '');
  const inputRef = useRef(null);
  const { starDocument, deleteDocument, renameDocument, restoreDocument } = useDocumentStore();

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRename = async () => {
    if (title.trim() && title !== doc.title) {
      await renameDocument(doc._id, title.trim());
    } else {
      setTitle(doc.title);
    }
    setIsEditing(false);
  };

  const onCardClick = (e) => {
    if (isEditing || isTrash) return;
    router.push(`/editor/${doc._id}`);
  };

  if (!doc) return <DocumentCardSkeleton />;

  return (
    <div 
      onClick={onCardClick}
      className={cn(
        "group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all hover:border-zinc-700",
        !isTrash && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-violet-500" />
        </div>
        
        <div className="flex items-center gap-1">
          {!isTrash && doc.isStarred && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
              {isTrash ? (
                <>
                  <DropdownMenuItem onClick={() => restoreDocument(doc._id)} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50">
                    <Undo2 className="w-4 h-4" /> Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteDocument(doc._id, true)} className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400">
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50">
                    <Edit2 className="w-4 h-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => starDocument(doc._id)} className="gap-2 focus:bg-zinc-800 focus:text-zinc-50">
                    <Star className={cn("w-4 h-4", doc.isStarred && "fill-yellow-500 text-yellow-500")} /> 
                    {doc.isStarred ? 'Unstar' : 'Star'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteDocument(doc._id)} className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400">
                    <Trash2 className="w-4 h-4" /> Move to Trash
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="h-7 py-0 px-1 bg-zinc-800 border-violet-500 focus-visible:ring-0 text-zinc-50"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 className="font-medium text-zinc-50 truncate pr-4">
            {doc.title}
          </h3>
        )}
        
        <p className="text-xs text-zinc-500 mt-1">
          Edited {formatDistanceToNow(new Date(doc.lastEditedAt))} ago
        </p>
      </div>
    </div>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-lg bg-zinc-800" />
        <Skeleton className="w-8 h-8 rounded-full bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4 bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 bg-zinc-800" />
      </div>
    </div>
  );
}
