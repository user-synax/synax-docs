'use client';

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import DocumentGrid from '@/components/dashboard/DocumentGrid';

export default function TrashPage() {
  const { fetchDocuments } = useDocumentStore();

  useEffect(() => {
    fetchDocuments({ trash: true });
  }, [fetchDocuments]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 tracking-tight">
            Trash
          </h1>
        </div>
        <p className="text-zinc-500 mt-2 md:ml-13">
          Documents here are marked for deletion.
        </p>
      </div>

      <DocumentGrid isTrash={true} />
    </div>
  );
}
