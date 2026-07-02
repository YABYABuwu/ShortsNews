'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogOut, User as UserIcon, PlusSquare, BookOpen, Shield } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0f172a]/80 border-b border-slate-800 text-white shadow-lg transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-cyan-400 font-extrabold text-xl sm:text-2xl tracking-wider transition-all group-hover:text-cyan-300">
                SHORTS<span className="text-white">NEWS</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1 text-slate-300 hover:text-cyan-400 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {user && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 text-slate-300 hover:text-indigo-400 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <PlusSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Create Post</span>
              </Link>
            )}

            <div className="border-l border-slate-700 h-6 mx-1 sm:mx-2 hidden xs:block"></div>

            {loading ? (
              <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1.5 bg-slate-800/80 p-2 sm:px-3 sm:py-1.5 rounded-full border border-slate-700">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-200 max-w-[100px] truncate hidden md:inline">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 border border-red-900/60 p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-950/50 hover:shadow-cyan-950/50 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 hover:scale-[1.02]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
