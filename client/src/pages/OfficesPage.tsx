import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigation } from 'lucide-react';
import { api } from '../lib/api';
import type { Office } from '../types';

export default function OfficesPage() {
  const { data = [] } = useQuery({ queryKey: ['offices'], queryFn: async () => (await api.get<Office[]>('/offices')).data });
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => navigator.geolocation?.getCurrentPosition((p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude })), []);
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY;

  return (
    <div className="space-y-6">
      {loc ? (
        <iframe
          className="h-80 w-full rounded-2xl"
          loading="lazy"
          src={`https://www.google.com/maps/embed/v1/view?key=${mapKey}&center=${loc.lat},${loc.lng}&zoom=13`}
        />
      ) : (
        <p className="rounded bg-orange-100 p-3">Enable location access to see nearby map.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((o) => {
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${o.latitude},${o.longitude}`;
          return (
            <div className="rounded-2xl bg-white p-4 shadow" key={o._id}>
              <h3 className="font-bold">{o.name}</h3>
              <p>{o.address}</p>
              <p>{o.workingHours}</p>
              <p>{o.servicesOffered.join(', ')}</p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-3 py-2 font-semibold text-white transition hover:opacity-90"
              >
                <Navigation size={16} />
                Get Directions
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
