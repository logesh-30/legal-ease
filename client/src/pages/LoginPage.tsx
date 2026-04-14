import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

type FormValues = { name?: string; email: string; password: string; mode: 'login' | 'register' };

export default function LoginPage() {
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: { mode: 'login' },
  });
  const nav = useNavigate();
  const mode = watch('mode');

  const onSubmit = async (v: FormValues) => {
    await api.post(`/auth/${v.mode === 'login' ? 'login' : 'register'}`, v);
    nav('/');
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
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--navy-dark)' }}>
            Welcome to LegalEase
          </h1>
          <p className="mt-1 text-sm text-slate-500">Government services made simple</p>
        </div>

        <div className="card p-8">
          {/* Mode tabs */}
          <div
            className="mb-6 flex rounded-xl p-1"
            style={{ background: 'var(--bg)' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setValue('mode', m)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: 'var(--navy)', color: '#fff', boxShadow: '0 2px 8px rgba(26,60,143,0.25)' }
                    : { color: 'var(--navy-dark)' }
                }
              >
                {m === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('mode')} />

            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('name')}
                  placeholder="Full Name"
                  className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: '#e2e8f0', '--tw-ring-color': 'var(--navy-light)' } as any}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('email', { required: true })}
                placeholder="Email address"
                type="email"
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2"
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('password', { required: true })}
                placeholder="Password"
                type="password"
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2"
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base mt-2">
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
