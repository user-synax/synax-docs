"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import PublicEditor from '@/components/editor/PublicEditor';
import EditorCore from '@/components/editor/EditorCore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Edit3, ArrowRight } from 'lucide-react';

export default function PublicSharePage({ params }) {
  const { token } = use(params);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const fetchPublicDoc = async () => {
      try {
        const response = await fetch(`/api/share/${token}`);
        if (!response.ok) {
          if (response.status === 403) {
            setError('Private document');
          } else if (response.status === 404) {
            setError('Document not found');
          } else {
            setError('Something went wrong');
          }
          return;
        }
        const data = await response.json();
        setDoc(data);
      } catch (error) {
        console.error('Fetch Error:', error);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPublicDoc();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-zinc-950">
        <div className="h-[52px] border-b border-zinc-800 flex items-center px-4 justify-between">
           <Skeleton className="w-32 h-6 rounded bg-zinc-900" />
           <Skeleton className="w-24 h-8 rounded-pill bg-zinc-900" />
        </div>
        <div className="flex-1 max-w-[900px] mx-auto w-full py-[80px] px-[40px] space-y-6">
          <Skeleton className="w-2/3 h-10 bg-zinc-900 rounded" />
          <Skeleton className="w-full h-64 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-ink px-4">
        <div className="w-16 h-16 bg-surface-1 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-ink-muted" />
        </div>
        <h1 className="text-2xl font-medium mb-2">{error}</h1>
        <p className="text-ink-muted mb-8 text-center max-w-md">
            This document might be private or the link has expired. 
            Ask the owner for a new share link.
        </p>
        <Button 
            asChild
            className="bg-primary text-on-primary rounded-pill"
        >
            <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isEditable = doc.shareMode === 'public-edit';

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      {/* Minimal TopBar */}
      <header className="h-[52px] border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 z-30 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-[12px] uppercase tracking-widest font-bold text-ink">
            synax<span className="text-ink-muted">docs</span>
          </Link>
          <div className="h-4 w-px bg-hairline mx-2" />
          <h1 className="text-sm font-medium text-ink truncate max-w-[200px] md:max-w-[400px]">
            {doc.title}
          </h1>
          <Badge variant="outline" className="bg-surface-1 border-hairline text-ink-muted gap-1.5 py-0.5">
            {isEditable ? (
                <>
                    <Edit3 className="w-3 h-3" />
                    Public Edit
                </>
            ) : (
                <>
                    <Eye className="w-3 h-3" />
                    View only
                </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-end gap-3 flex-1">
          {!isSignedIn && (
            <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-ink-muted">Sign in to save your own copy</span>
                <SignInButton mode="modal">
                    <Button variant="secondary" size="sm" className="h-8 rounded-pill bg-surface-1 hover:bg-surface-2 text-ink">
                        Sign In
                    </Button>
                </SignInButton>
            </div>
          )}
          {isSignedIn && (
             <Button asChild variant="secondary" size="sm" className="h-8 rounded-pill bg-surface-1 hover:bg-surface-2 text-ink gap-2">
                <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
             </Button>
          )}
        </div>
      </header>

      {!isSignedIn && (
          <div className="bg-accent-blue/10 border-b border-accent-blue/20 py-2 px-4 flex items-center justify-center gap-3">
              <span className="text-xs font-medium text-ink">You're viewing a shared document.</span>
              <SignInButton mode="modal">
                  <button className="text-xs font-bold text-accent-blue hover:underline">
                      Sign in to create your own documents →
                  </button>
              </SignInButton>
          </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {isEditable ? (
            <EditorCore 
                initialContent={doc.content} 
                documentId={doc.id} 
                onEditorReady={setEditor}
            />
        ) : (
            <PublicEditor initialContent={doc.content} />
        )}
      </div>
    </div>
  );
}
