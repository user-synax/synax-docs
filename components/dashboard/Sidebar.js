'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Home, 
  Clock, 
  Star, 
  Trash2, 
  LogOut,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Recent', icon: Clock, href: '/dashboard/recent' },
  { label: 'Starred', icon: Star, href: '/dashboard/starred' },
  { label: 'Trash', icon: Trash2, href: '/dashboard/trash' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-zinc-900 border-r border-zinc-800 flex flex-col z-20">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-50">
            synax<span className="text-violet-500">docs</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-zinc-800 text-violet-500" 
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="w-9 h-9 border border-zinc-800">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-50 truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="w-full justify-start gap-3 mt-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
