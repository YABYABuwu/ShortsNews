'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase/actions';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            หรือ{' '}
            <Link
              href="/register"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              สมัครสมาชิกใหม่ที่นี่
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-350 p-4 rounded-lg flex items-start space-x-2.5 text-sm text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-350 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-350 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-855 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-extrabold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] shadow-lg shadow-indigo-950/50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-cyan-200 group-hover:text-cyan-150 transition-colors" />
              </span>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-semibold">หรือ</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <div>
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-bold text-slate-200 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.606 0 3.078.614 4.2 1.625l3.1-3.1C18.916 2.378 15.82 1 12.24 1C6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.89 0 10.74-4.225 10.74-10.74 0-.712-.064-1.396-.188-2.055H12.24z" />
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
