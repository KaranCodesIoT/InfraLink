import React from 'react';
import { MapPin } from 'lucide-react';

export default function LiveMap({ location, title = "Location Map" }) {
  if (!location || location === 'Location hidden' || location === 'Not provided') {
    return (
      <div className="w-full h-48 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
        <MapPin className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">Location not provided</p>
      </div>
    );
  }

  // Google Maps basic embed URL (Requires ZERO API keys)
  const encodedAddress = encodeURIComponent(location);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-full min-h-[250px] relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
      <div className="absolute top-0 left-0 w-full px-3 py-2 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center gap-2 pointer-events-none text-white transition-opacity">
         <MapPin className="w-4 h-4 text-orange-400 drop-shadow-md" />
         <span className="text-xs font-bold tracking-wide drop-shadow-md">{title} - {location}</span>
      </div>
      <iframe 
        width="100%" 
        height="100%" 
        style={{ minHeight: '250px' }}
        src={mapUrl}
        frameBorder="0" 
        scrolling="no" 
        marginHeight="0" 
        marginWidth="0"
        title={`Live Map for ${location}`}
        className="w-full block"
        loading="lazy"
        allowFullScreen
      ></iframe>
    </div>
  );
}
