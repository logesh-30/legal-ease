import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Briefcase, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import type { Office } from '../types';

export default function OfficesPage() {
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locDenied, setLocDenied] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocDenied(true)
    );
  }, []);

  const { data: cities = [] } = useQuery({
    queryKey: ['office-cities'],
    queryFn: async () => (await api.get<string[]>('/offices/cities')).data,
  });

  const queryParam = selectedCity
    ? `?city=${encodeURIComponent(selectedCity)}`
    : loc
    ? `?lat=${loc.lat}&lng=${loc.lng}`
    : null;

  const { data = [], isLoading } = useQuery({
    queryKey: ['offices', queryParam],
    enabled: !!queryParam,
    queryFn: async () => (await api.get<Office[]>(`/offices${queryParam}`)).data,
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div
        className="rounded-2xl px-8 py-10"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(249,115,22,0.2)' }}
          >
            <MapPin size={20} color="var(--saffron-light)" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Nearby Government Offices</h1>
        </div>
        <p className="text-white/70 text-sm">Find and get directions to government offices near you</p>
      </div>

      {/* City selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--navy)' }} />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full appearance-none rounded-xl border px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none"
            style={{ borderColor: '#1a3c8f30', color: 'var(--navy-dark)', background: '#fff' }}
          >
            <option value="">📍 Use my location</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {selectedCity && (
          <button
            onClick={() => setSelectedCity('')}
            className="text-xs underline"
            style={{ color: 'var(--navy)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Location status */}
      {!selectedCity && !loc && (
        <div
          className="flex items-center gap-3 rounded-2xl p-5"
          style={{ background: '#f9731610', border: '1px solid #f9731630' }}
        >
          <AlertCircle size={20} style={{ color: 'var(--saffron)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--navy-dark)' }}>
            {locDenied
              ? 'Location access was denied. Select a city manually from the dropdown above.'
              : 'Enable location access or select a city manually above.'}
          </p>
        </div>
      )}

      {/* Office count */}
      {queryParam && <p className="text-sm text-slate-500">
        {selectedCity ? `${data.length} offices in ${selectedCity}` : `${data.length} offices near you`}
      </p>}

      {/* Office cards */}
      {!queryParam ? null : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">
          {selectedCity ? `No offices found in ${selectedCity}.` : 'No government offices found within 30 km of your location.'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((o) => (
            <div key={o._id} className="card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#1a3c8f12' }}
                >
                  <MapPin size={18} style={{ color: 'var(--navy)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--navy-dark)' }}>{o.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{o.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock size={13} style={{ color: 'var(--mint)' }} />
                {o.workingHours}
              </div>

              {o.servicesOffered.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <Briefcase size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--sky)' }} />
                  <span className="line-clamp-2">{o.servicesOffered.join(', ')}</span>
                </div>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${o.latitude},${o.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm no-underline"
                style={{ display: 'inline-flex' }}
              >
                <Navigation size={14} />
                Get Directions
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
