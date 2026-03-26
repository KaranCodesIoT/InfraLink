import { useState } from 'react';
import {
  MapPin, Building2, IndianRupee, CalendarDays, ShieldCheck,
  BadgeCheck, ChevronLeft, ChevronRight, Sparkles, Heart, Loader2
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth.js';

export default function StepPreviewSubmit({ data, isSubmitting, onSubmit }) {
  const { user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const previews = data._imagePreviews || [];

  const prevImg = () => setImgIdx((i) => (i === 0 ? previews.length - 1 : i - 1));
  const nextImg = () => setImgIdx((i) => (i === previews.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Preview & Submit</h3>
          <p className="text-sm text-gray-500">Review your listing before publishing</p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Image Carousel */}
        {previews.length > 0 && (
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <img src={previews[imgIdx]} alt="Preview" className="w-full h-full object-cover" />
            {previews.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {previews.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
            {data.projectStatus && (
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                data.projectStatus === 'Ready to Move'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {data.projectStatus}
              </span>
            )}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Title & Location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.projectName || 'Project Name'}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{data.area || 'Area'}, {data.city || 'City'}</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Type', value: data.propertyType, icon: Building2 },
              { label: 'Config', value: data.configuration, icon: Building2 },
              { label: 'Price', value: data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : '—', icon: IndianRupee },
              { label: 'Possession', value: data.possessionDate || '—', icon: CalendarDays },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Units Row */}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">Total Units: <strong className="text-gray-800">{data.totalUnits || '—'}</strong></span>
            <span className="text-gray-500">Available: <strong className="text-emerald-600">{data.availableUnits || '—'}</strong></span>
          </div>

          {/* Description */}
          {data.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{data.description}</p>
          )}

          {/* RERA */}
          {data.reraNumber && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>RERA: {data.reraNumber}</span>
            </div>
          )}

          {/* Amenities */}
          {data.amenities?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {data.amenities.map((a) => (
                  <span key={a} className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby */}
          {data.nearbyFacilities?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Nearby</p>
              <div className="flex flex-wrap gap-1.5">
                {data.nearbyFacilities.map((f) => (
                  <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Builder Card */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Builder'}</span>
                {user?.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500">Builder / Developer</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition"
            >
              <Heart className="w-3.5 h-3.5" /> Follow
            </button>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Publishing…</>
        ) : (
          '🚀 Publish Project'
        )}
      </button>
    </div>
  );
}
