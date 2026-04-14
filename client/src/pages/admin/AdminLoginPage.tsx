import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminLoginPage() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const nav = useNavigate();

  const onSubmit = async (v: { email: string; password: string }) => {
    await api.post('/auth/login', v);
    nav('/admin');
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
          >
            <Shield size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--navy-dark)' }}>Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-500">LegalEase Administration</p>
        </div>

        <div className="card p-8">
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#1a3c8f0d', color: 'var(--navy)' }}
          >
            <strong>Default credentials:</strong> admin@legalease.com / Admin@123
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('email')}
                defaultValue="admin@legalease.com"
                type="email"
                placeholder="Admin email"
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none"
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('password')}
                defaultValue="Admin@123"
                type="password"
                placeholder="Password"
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none"
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>

            <button type="submit" className="btn-navy w-full justify-center py-3.5 text-base mt-2">
              <LogIn size={18} />
              Sign In to Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
