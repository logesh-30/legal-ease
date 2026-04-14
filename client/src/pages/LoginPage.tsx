import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

type FormValues = { name?: string; email: string; password: string; mode: 'login' | 'register' };

export default function LoginPage() {
  const { register, handleSubmit, watch } = useForm<FormValues>({ defaultValues: { mode: 'login' } });
  const nav = useNavigate();
  const mode = watch('mode');
  const onSubmit = async (v: FormValues) => {
    await api.post(`/auth/${v.mode === 'login' ? 'login' : 'register'}`, v);
    nav('/');
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded-2xl bg-white p-6 shadow"><h2 className="text-2xl font-bold">Account</h2><select {...register('mode')} className="w-full rounded border p-2"><option value="login">Login</option><option value="register">Register</option></select>{mode === 'register' && <input {...register('name')} placeholder="Name" className="w-full rounded border p-2" />}<input {...register('email', { required: true })} placeholder="Email" className="w-full rounded border p-2" /><input {...register('password', { required: true })} placeholder="Password" type="password" className="w-full rounded border p-2" /><button className="w-full rounded bg-[#f97316] py-2 font-bold text-white">Submit</button></form>;
}
