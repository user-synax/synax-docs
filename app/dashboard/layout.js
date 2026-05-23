'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex fixed left-0 top-0 z-20" />
      
      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-50">
            synax<span className="text-violet-500">docs</span>
          </span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-zinc-900 border-zinc-800 w-[240px]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 md:ml-[240px] relative pt-14 md:pt-0">
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
        
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
