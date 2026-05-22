'use client';

import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import DocumentGrid from '@/components/dashboard/DocumentGrid';

export default function StarredPage() {
  const { fetchDocuments } = useDocumentStore();

  useEffect(() => {
    fetchDocuments({ starred: true });
  }, [fetchDocuments]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
            Starred Documents
          </h1>
        </div>
        <p className="text-zinc-500 mt-2 ml-13">
          Quick access to your most important documents.
        </p>
      </div>

      <DocumentGrid />
    </div>
  );
}
