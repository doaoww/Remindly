'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await register(form.email, form.password, form.fullName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full opacity-5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md fade-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] mb-4">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Start learning</h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm">Create your free account</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" placeholder="Alex Johnson" value={form.fullName} onChange={set('fullName')} icon={<User size={16} />} />
            <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} icon={<Mail size={16} />} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} icon={<Lock size={16} />} required />

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}