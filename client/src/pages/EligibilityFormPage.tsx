import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { EligibilityProfile } from '../types';
import { useTranslation } from 'react-i18next';

type FormValues = EligibilityProfile;

export default function EligibilityFormPage() {
  const { i18n } = useTranslation();
  const ta = i18n.language === 'ta';
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['eligibility-profile'],
    queryFn: async () => (await api.get<EligibilityProfile | null>('/eligibility')).data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      age: 0,
      gender: 'Male',
      annualIncome: 0,
      occupation: 'Other',
      category: 'General',
      state: 'Tamil Nadu',
      isStudent: false,
      isFarmer: false,
      isSeniorCitizen: false,
      isDifferentlyAbled: false,
    },
  });

  useEffect(() => {
    if (!data) return;
    reset(data);
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await api.post('/eligibility', values);
      navigate('/eligible-schemes');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setApiError(axiosError.response?.data?.message ?? 'Unable to save eligibility details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="card p-8">{ta ? 'தகவல் படிவம் ஏற்றப்படுகிறது...' : 'Loading eligibility form...'}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--navy)' }}>
        <span className="rounded-full px-2 py-0.5 text-white" style={{ background: 'var(--saffron)' }}>1</span>
        <span>{ta ? 'விவரங்களை நிரப்பவும்' : 'Fill Your Details'}</span>
        <ArrowRight size={14} />
        <span className="opacity-70">{ta ? 'திட்டங்களை காண்க' : 'View Schemes'}</span>
      </div>

      <div
        className="rounded-2xl px-8 py-8 text-white"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-center gap-3">
          <ClipboardList size={24} />
          <h1 className="text-2xl font-extrabold">{ta ? 'தகுதி விவரங்கள்' : 'Eligibility Details'}</h1>
        </div>
        <p className="text-white/80 text-sm mt-2">
          {ta ? 'தனிப்பட்ட திட்ட பரிந்துரைகளை பெற உங்கள் விவரங்களை நிரப்பவும்.' : 'Fill your details to get personalized scheme recommendations.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{ta ? 'வயது' : 'Age'}</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm"
              {...register('age', {
                required: ta ? 'வயது அவசியம்' : 'Age is required',
                valueAsNumber: true,
                min: { value: 1, message: ta ? 'வயது 0-ஐ விட அதிகமாக இருக்க வேண்டும்' : 'Age must be > 0' }
              })}
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{ta ? 'ஆண்டு வருமானம் (ரூபாய்)' : 'Annual Income (INR)'}</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm"
              {...register('annualIncome', {
                required: ta ? 'வருமானம் அவசியம்' : 'Annual income is required',
                valueAsNumber: true,
                min: { value: 1, message: ta ? 'வருமானம் 0-ஐ விட அதிகமாக இருக்க வேண்டும்' : 'Income must be > 0' },
              })}
            />
            {errors.annualIncome && <p className="text-red-500 text-sm mt-1">{errors.annualIncome.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{ta ? 'பாலினம்' : 'Gender'}</label>
            <select className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" {...register('gender', { required: true })}>
              <option value="Male">{ta ? 'ஆண்' : 'Male'}</option>
              <option value="Female">{ta ? 'பெண்' : 'Female'}</option>
              <option value="Other">{ta ? 'மற்றவை' : 'Other'}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{ta ? 'வகுப்பு' : 'Category'}</label>
            <select className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" {...register('category', { required: true })}>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{ta ? 'தொழில்' : 'Occupation'}</label>
            <select className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" {...register('occupation', { required: true })}>
              <option value="Farmer">{ta ? 'விவசாயி' : 'Farmer'}</option>
              <option value="Student">{ta ? 'மாணவர்' : 'Student'}</option>
              <option value="Salaried">{ta ? 'சம்பள ஊழியர்' : 'Salaried Employee'}</option>
              <option value="Self Employed">{ta ? 'சுயதொழில்' : 'Self Employed'}</option>
              <option value="Unemployed">{ta ? 'வேலைஇல்லா' : 'Unemployed'}</option>
              <option value="Other">{ta ? 'மற்றவை' : 'Other'}</option>
            </select>
            {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{ta ? 'மாநிலம்' : 'State'}</label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm"
              {...register('state', { required: 'Required fields cannot be empty' })}
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">{ta ? 'சிறப்பு நிலைகள்' : 'Special Conditions'}</p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <label><input type="checkbox" {...register('isStudent')} /> {ta ? 'நான் மாணவர்' : 'I am a Student'}</label>
            <label><input type="checkbox" {...register('isFarmer')} /> {ta ? 'நான் விவசாயி' : 'I am a Farmer'}</label>
            <label><input type="checkbox" {...register('isSeniorCitizen')} /> {ta ? 'நான் மூத்த குடிமகன் (60+)' : 'I am a Senior Citizen (60+)'}</label>
            <label><input type="checkbox" {...register('isDifferentlyAbled')} /> {ta ? 'நான் மாற்றுத் திறனாளி' : 'I am Differently Abled'}</label>
          </div>
        </div>

        {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (ta ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (ta ? 'தகுதி திட்டங்களுக்கு தொடரவும்' : 'Continue to Eligible Schemes')} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
