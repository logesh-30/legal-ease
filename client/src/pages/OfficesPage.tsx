import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Briefcase, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { Office } from '../types';

export default function OfficesPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: async () => (await api.get<Office[]>('/offices')).data,
  });
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY;

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((p) =>
      setLoc({ lat: p.coords.latitude, lng: p.coords.longitude })
    );
  }, []);

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

      {/* Map */}
      {loc ? (
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <iframe
            className="h-80 w-full block"
            loading="lazy"
            title="Nearby offices map"
            src={`https://www.google.com/maps/embed/v1/view?key=${mapKey}&center=${loc.lat},${loc.lng}&zoom=13`}
          />
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-2xl p-5"
          style={{ background: '#f9731610', border: '1px solid #f9731630' }}
        >
          <AlertCircle size={20} style={{ color: 'var(--saffron)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--navy-dark)' }}>
            Enable location access to see the map of nearby offices.
          </p>
        </div>
      )}

      {/* Office count */}
      <p className="text-sm text-slate-500">{data.length} offices listed</p>

      {/* Office cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
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
