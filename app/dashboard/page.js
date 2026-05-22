'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDocumentStore } from '@/store/documentStore';
import DocumentGrid from '@/components/dashboard/DocumentGrid';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    searchQuery, 
    setSearchQuery, 
    fetchDocuments, 
    createDocument 
  } = useDocumentStore();
  
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, fetchDocuments]);

  const handleCreate = async () => {
    const id = await createDocument();
    if (id) {
      router.push(`/editor/${id}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
            My Documents
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage and organize your collaborative files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search documents..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-violet-500 text-zinc-300 rounded-lg h-10"
            />
          </div>
          
          <Button 
            onClick={handleCreate}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-10 px-4 gap-2 shadow-lg shadow-violet-900/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Document</span>
          </Button>
        </div>
      </div>

      <DocumentGrid />
    </div>
  );
}
