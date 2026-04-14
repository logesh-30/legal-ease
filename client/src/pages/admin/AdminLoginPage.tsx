import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const nav = useNavigate();
  const onSubmit = async (v: { email: string; password: string }) => {
    await api.post('/auth/login', v);
    nav('/admin');
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded bg-white p-6 shadow"><h1 className="text-2xl font-bold">Admin Login</h1><input {...register('email')} className="w-full rounded border p-2" defaultValue="admin@legalease.com" /><input {...register('password')} className="w-full rounded border p-2" type="password" defaultValue="Admin@123" /><button className="w-full rounded bg-[#1a3c8f] py-2 text-white">Login</button></form>;
}
