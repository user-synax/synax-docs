'use client';

import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import DocumentGrid from '@/components/dashboard/DocumentGrid';

export default function RecentPage() {
  const { fetchDocuments } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 tracking-tight">
            Recent Documents
          </h1>
        </div>
        <p className="text-zinc-500 mt-2 md:ml-13">
          Documents you've recently viewed or edited.
        </p>
      </div>

      <DocumentGrid />
    </div>
  );
}
