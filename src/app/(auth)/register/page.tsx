'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail } from '@/lib/supabase/actions';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email, password, fullName);
      setSuccess(true);
      // Wait 3 seconds and redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            สมัครสมาชิก
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            หรือ{' '}
            <Link
              href="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              มีบัญชีผู้ใช้อยู่แล้ว? เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-lg flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-green-950/40 border border-green-800 text-green-400 p-5 rounded-lg flex flex-col items-center text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-400 animate-pulse" />
            <h3 className="text-lg font-bold">สมัครสมาชิกเสร็จสิ้น!</h3>
            <p className="text-sm text-slate-300">
              ระบบได้ส่งอีเมลยืนยันไปยังกล่องจดหมายของคุณแล้ว กรุณายืนยันตัวตนก่อนเข้าใช้งาน (กำลังพาท่านไปยังหน้าเข้าสู่ระบบ...)
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-slate-350 mb-1.5">
                  ชื่อ-นามสกุล (Full Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                    placeholder="สมชาย ใจดี"
                  />
                </div>
              </div>

              {/* Email */}
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
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-350 mb-1.5">
                  รหัสผ่าน (Password - ขั้นต่ำ 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-855 rounded-lg text-slate-200 placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-350 mb-1.5">
                  ยืนยันรหัสผ่าน (Confirm Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-855 rounded-lg text-slate-200 placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
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
                  <UserPlus className="h-5 w-5 text-cyan-200 group-hover:text-cyan-150 transition-colors" />
                </span>
                {loading ? 'กำลังดำเนินการ...' : 'ลงทะเบียนสมาชิก'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
