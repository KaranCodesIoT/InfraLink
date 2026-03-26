import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, CalendarDays, IndianRupee, ShieldCheck, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import useFavoritesStore from '../../../store/favorites.store.js';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';

export default function BuilderProjectCard({ project }) {
  const [imgIdx, setImgIdx] = useState(0);
  const { user } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { toast } = useUIStore();

  const isHearted = isFavorite(user?._id, project._id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }
    toggleFavorite(user._id, project);
    toast.success(isHearted ? 'Removed from favorites' : 'Added to favorites');
  };

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === project.images.length - 1 ? 0 : i + 1));
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === 0 ? project.images.length - 1 : i - 1));
  };

  return (
    <Link to={`/builder-projects/${project._id}`} className="block group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
      {/* Image Gallery carousel */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {project.images && project.images.length > 0 ? (
          <>
            <img 
              src={project.images[imgIdx]} 
              alt={project.projectName} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {project.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevImg} className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextImg} className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {project.images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Building2 className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {project.projectStatus && (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              project.projectStatus === 'Ready to Move' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
            }`}>
              {project.projectStatus}
            </span>
          )}
          {project.reraNumber && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-3 h-3" /> RERA
            </span>
          )}
        </div>

        <button 
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm z-20 ${
            isHearted ? 'bg-white text-red-500 hover:bg-gray-50' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isHearted ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors truncate">{project.projectName}</h3>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {project.area}, {project.city}
            </p>
          </div>
        </div>

        <div className="mt-4 mb-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Price Starts</span>
            <span className="text-sm font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-500" />
              {project.price?.toLocaleString('en-IN') || 'On Request'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Configuration</span>
            <span className="text-sm font-bold text-gray-900 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-gray-500" />
              {project.configuration}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Type</span>
            <span className="text-sm font-bold text-gray-900 capitalize">
              {project.propertyType?.replace('-', ' ')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Possession</span>
            <span className="text-sm font-bold text-gray-900 flex items-center">
              <CalendarDays className="w-3.5 h-3.5 mr-1 text-gray-500" />
              {project.possessionDate ? new Date(project.possessionDate).getFullYear() : 'Ongoing'}
            </span>
          </div>
        </div>

        {/* Amenities slice */}
        {project.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-gray-100">
            {project.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                {a}
              </span>
            ))}
            {project.amenities.length > 3 && (
              <span className="text-[10px] font-medium bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-100">
                +{project.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
