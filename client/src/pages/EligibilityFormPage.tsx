import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { ClipboardList, ArrowRight, User, MapPin, Wallet, Briefcase, GraduationCap, Users, Star, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { EligibilityProfile } from '../types';
import { useTranslation } from 'react-i18next';

const inputCls = 'mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200';
const labelCls = 'block text-sm font-medium text-slate-700';
const sectionCls = 'card p-6 space-y-4';

function SectionHeader({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#f1f5f9' }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--navy-dark)' }}>{title}</h2>
    </div>
  );
}

function CheckboxField({ label, reg }: { label: string; reg: any }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded accent-orange-500" {...reg} />
      {label}
    </label>
  );
}

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

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EligibilityProfile>({
    defaultValues: {
      age: undefined,
      gender: 'Male',
      maritalStatus: 'Single',
      state: 'Tamil Nadu',
      district: '',
      areaType: 'Rural',
      annualIncome: undefined,
      hasIncomeCertificate: false,
      isBPL: false,
      occupation: 'Other',
      educationLevel: '',
      institutionType: '',
      hasLand: false,
      landSize: '',
      highestQualification: '',
      isCurrentlyStudying: false,
      category: 'General',
      isMinority: false,
      familySize: 1,
      earningMembers: 1,
      isSeniorCitizen: false,
      isWidow: false,
      isDifferentlyAbled: false,
      isFarmer: false,
      isStudent: false,
    },
  });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const occupation = useWatch({ control, name: 'occupation' });
  const isStudentOcc = occupation === 'Student';
  const isFarmerOcc = occupation === 'Farmer';

  const onSubmit = async (values: EligibilityProfile) => {
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

  if (isLoading) return (
    <div className="card p-8 text-center text-slate-500">
      {ta ? 'தகவல் படிவம் ஏற்றப்படுகிறது...' : 'Loading eligibility form...'}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="card p-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--navy)' }}>
        <span className="rounded-full px-2 py-0.5 text-white text-xs" style={{ background: 'var(--saffron)' }}>1</span>
        <span>{ta ? 'விவரங்களை நிரப்பவும்' : 'Fill Your Details'}</span>
        <ArrowRight size={14} />
        <span className="opacity-60">{ta ? 'திட்டங்களை காண்க' : 'View Matched Schemes'}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl px-8 py-8 text-white" style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}>
        <div className="flex items-center gap-3">
          <ClipboardList size={24} />
          <h1 className="text-2xl font-extrabold">{ta ? 'தகுதி விவரங்கள்' : 'My Eligibility Profile'}</h1>
        </div>
        <p className="text-white/75 text-sm mt-2">
          {ta ? 'உங்களுக்கு பொருந்தும் திட்டங்களை கண்டறிய விவரங்களை நிரப்பவும்.' : 'Fill in your details accurately to find all government schemes you qualify for.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* A. Personal Details */}
        <div className={sectionCls}>
          <SectionHeader icon={User} title={ta ? 'தனிப்பட்ட விவரங்கள்' : 'A. Personal Details'} color="var(--navy)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'வயது' : 'Age'} *</label>
              <input type="number" className={inputCls} placeholder="e.g. 28"
                {...register('age', { required: 'Age is required', valueAsNumber: true, min: { value: 1, message: 'Age must be > 0' } })} />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className={labelCls}>{ta ? 'பாலினம்' : 'Gender'} *</label>
              <select className={inputCls} {...register('gender', { required: true })}>
                <option value="Male">{ta ? 'ஆண்' : 'Male'}</option>
                <option value="Female">{ta ? 'பெண்' : 'Female'}</option>
                <option value="Other">{ta ? 'மற்றவை' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{ta ? 'திருமண நிலை' : 'Marital Status'}</label>
              <select className={inputCls} {...register('maritalStatus')}>
                <option value="Single">{ta ? 'திருமணமாகாதவர்' : 'Single'}</option>
                <option value="Married">{ta ? 'திருமணமானவர்' : 'Married'}</option>
                <option value="Widow">{ta ? 'விதவை / விதுரன்' : 'Widow / Widower'}</option>
                <option value="Divorced">{ta ? 'விவாகரத்து' : 'Divorced'}</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <CheckboxField label={ta ? 'மாற்றுத் திறனாளி' : 'I am Differently Abled'} reg={register('isDifferentlyAbled')} />
            </div>
          </div>
        </div>

        {/* B. Location Details */}
        <div className={sectionCls}>
          <SectionHeader icon={MapPin} title={ta ? 'இருப்பிட விவரங்கள்' : 'B. Location Details'} color="var(--sky)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'மாநிலம்' : 'State'} *</label>
              <input className={inputCls} {...register('state', { required: 'State is required' })} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className={labelCls}>{ta ? 'மாவட்டம்' : 'District'}</label>
              <input className={inputCls} placeholder={ta ? 'உ.ம். சென்னை' : 'e.g. Chennai'} {...register('district')} />
            </div>
            <div>
              <label className={labelCls}>{ta ? 'பகுதி வகை' : 'Area Type'}</label>
              <select className={inputCls} {...register('areaType')}>
                <option value="Rural">{ta ? 'கிராமப்புறம்' : 'Rural'}</option>
                <option value="Urban">{ta ? 'நகர்ப்புறம்' : 'Urban'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* C. Income Details */}
        <div className={sectionCls}>
          <SectionHeader icon={Wallet} title={ta ? 'வருமான விவரங்கள்' : 'C. Income Details'} color="var(--mint)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'ஆண்டு குடும்ப வருமானம் (₹)' : 'Annual Family Income (₹)'} *</label>
              <input type="number" className={inputCls} placeholder="e.g. 120000"
                {...register('annualIncome', { required: 'Income is required', valueAsNumber: true, min: { value: 0, message: 'Must be ≥ 0' } })} />
              {errors.annualIncome && <p className="text-red-500 text-xs mt-1">{errors.annualIncome.message}</p>}
            </div>
            <div className="flex flex-col gap-3 justify-end pb-1">
              <CheckboxField label={ta ? 'வருமான சான்றிதழ் உள்ளது' : 'Income Certificate Available'} reg={register('hasIncomeCertificate')} />
              <CheckboxField label={ta ? 'BPL ரேஷன் கார்டு உள்ளது' : 'I have a BPL Ration Card'} reg={register('isBPL')} />
            </div>
          </div>
        </div>

        {/* D. Occupation Details */}
        <div className={sectionCls}>
          <SectionHeader icon={Briefcase} title={ta ? 'தொழில் விவரங்கள்' : 'D. Occupation Details'} color="var(--saffron)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'தொழில் வகை' : 'Occupation Type'} *</label>
              <select className={inputCls} {...register('occupation', { required: true })}>
                <option value="Student">{ta ? 'மாணவர்' : 'Student'}</option>
                <option value="Farmer">{ta ? 'விவசாயி' : 'Farmer'}</option>
                <option value="Govt Employee">{ta ? 'அரசு ஊழியர்' : 'Govt Employee'}</option>
                <option value="Private Employee">{ta ? 'தனியார் ஊழியர்' : 'Private Employee'}</option>
                <option value="Self Employed">{ta ? 'சுயதொழில்' : 'Self Employed'}</option>
                <option value="Unemployed">{ta ? 'வேலையில்லாதவர்' : 'Unemployed'}</option>
                <option value="Other">{ta ? 'மற்றவை' : 'Other'}</option>
              </select>
            </div>
          </div>

          {/* Student sub-fields */}
          {isStudentOcc && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
              <div>
                <label className={labelCls}>{ta ? 'கல்வி நிலை' : 'Education Level'}</label>
                <select className={inputCls} {...register('educationLevel')}>
                  <option value="">{ta ? 'தேர்வு செய்யவும்' : 'Select'}</option>
                  <option value="School">{ta ? 'பள்ளி' : 'School (1–12)'}</option>
                  <option value="UG">{ta ? 'இளங்கலை' : 'Under Graduate (UG)'}</option>
                  <option value="PG">{ta ? 'முதுகலை' : 'Post Graduate (PG)'}</option>
                  <option value="Other">{ta ? 'மற்றவை' : 'Other'}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{ta ? 'நிறுவன வகை' : 'Institution Type'}</label>
                <select className={inputCls} {...register('institutionType')}>
                  <option value="">{ta ? 'தேர்வு செய்யவும்' : 'Select'}</option>
                  <option value="Government">{ta ? 'அரசு' : 'Government'}</option>
                  <option value="Private">{ta ? 'தனியார்' : 'Private'}</option>
                </select>
              </div>
            </div>
          )}

          {/* Farmer sub-fields */}
          {isFarmerOcc && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
              <div className="flex items-end pb-1">
                <CheckboxField label={ta ? 'நில உரிமை உள்ளது' : 'I own agricultural land'} reg={register('hasLand')} />
              </div>
              <div>
                <label className={labelCls}>{ta ? 'நில அளவு (ஏக்கர்)' : 'Land Size (acres)'}</label>
                <input className={inputCls} placeholder="e.g. 2.5" {...register('landSize')} />
              </div>
            </div>
          )}
        </div>

        {/* E. Education Details */}
        <div className={sectionCls}>
          <SectionHeader icon={GraduationCap} title={ta ? 'கல்வி விவரங்கள்' : 'E. Education Details'} color="var(--sky)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'உயர்ந்த தகுதி' : 'Highest Qualification'}</label>
              <select className={inputCls} {...register('highestQualification')}>
                <option value="">{ta ? 'தேர்வு செய்யவும்' : 'Select'}</option>
                <option value="No formal education">{ta ? 'கல்வியறிவு இல்லை' : 'No formal education'}</option>
                <option value="Primary (1–5)">{ta ? 'தொடக்கக் கல்வி (1–5)' : 'Primary (1–5)'}</option>
                <option value="Middle (6–8)">{ta ? 'நடுநிலை (6–8)' : 'Middle (6–8)'}</option>
                <option value="SSLC / 10th">{ta ? 'SSLC / 10ஆம் வகுப்பு' : 'SSLC / 10th'}</option>
                <option value="HSC / 12th">{ta ? 'HSC / 12ஆம் வகுப்பு' : 'HSC / 12th'}</option>
                <option value="Diploma / ITI">{ta ? 'டிப்ளோமா / ITI' : 'Diploma / ITI'}</option>
                <option value="UG Degree">{ta ? 'இளங்கலை பட்டம்' : 'UG Degree'}</option>
                <option value="PG Degree">{ta ? 'முதுகலை பட்டம்' : 'PG Degree'}</option>
                <option value="PhD">{ta ? 'முனைவர் பட்டம்' : 'PhD'}</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <CheckboxField label={ta ? 'தற்போது படிக்கிறேன்' : 'Currently Studying'} reg={register('isCurrentlyStudying')} />
            </div>
          </div>
        </div>

        {/* F. Social Details */}
        <div className={sectionCls}>
          <SectionHeader icon={Star} title={ta ? 'சமூக விவரங்கள்' : 'F. Social Details'} color="var(--gold)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'வகுப்பு' : 'Category'} *</label>
              <select className={inputCls} {...register('category', { required: true })}>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <CheckboxField label={ta ? 'சிறுபான்மையினர்' : 'I belong to a Minority community'} reg={register('isMinority')} />
            </div>
          </div>
        </div>

        {/* G. Family Details */}
        <div className={sectionCls}>
          <SectionHeader icon={Users} title={ta ? 'குடும்ப விவரங்கள்' : 'G. Family Details'} color="var(--navy-light)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ta ? 'குடும்ப அளவு' : 'Family Size'}</label>
              <input type="number" className={inputCls} min={1} placeholder="e.g. 4"
                {...register('familySize', { valueAsNumber: true, min: 1 })} />
            </div>
            <div>
              <label className={labelCls}>{ta ? 'சம்பாதிக்கும் உறுப்பினர்கள்' : 'Number of Earning Members'}</label>
              <input type="number" className={inputCls} min={0} placeholder="e.g. 2"
                {...register('earningMembers', { valueAsNumber: true, min: 0 })} />
            </div>
          </div>
        </div>

        {/* H. Special Conditions */}
        <div className={sectionCls}>
          <SectionHeader icon={AlertCircle} title={ta ? 'சிறப்பு நிலைகள்' : 'H. Special Conditions'} color="#ec4899" />
          <p className="text-xs text-slate-500">{ta ? 'பொருந்தும் அனைத்தையும் தேர்வு செய்யவும்' : 'Select all that apply to you'}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <CheckboxField label={ta ? 'மூத்த குடிமகன் (60+)' : 'Senior Citizen (60+)'} reg={register('isSeniorCitizen')} />
            <CheckboxField label={ta ? 'விதவை / விதுரன்' : 'Widow / Widower'} reg={register('isWidow')} />
            <CheckboxField label={ta ? 'மாற்றுத் திறனாளி' : 'Differently Abled'} reg={register('isDifferentlyAbled')} />
            <CheckboxField label={ta ? 'விவசாயி' : 'Farmer'} reg={register('isFarmer')} />
            <CheckboxField label={ta ? 'மாணவர்' : 'Student'} reg={register('isStudent')} />
          </div>
        </div>

        {apiError && (
          <div className="rounded-xl p-3 text-sm font-medium" style={{ background: '#ef444415', color: '#ef4444' }}>
            {apiError}
          </div>
        )}

        <button type="submit" className="btn-primary w-full justify-center py-4 text-base" disabled={isSubmitting}>
          {isSubmitting
            ? (ta ? 'சேமிக்கப்படுகிறது...' : 'Saving...')
            : (ta ? 'பொருந்தும் திட்டங்களை காண்க' : 'Find My Eligible Schemes')}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
