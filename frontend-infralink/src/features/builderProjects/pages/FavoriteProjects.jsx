import { Heart, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFavoritesStore from '../../../store/favorites.store.js';
import useAuthStore from '../../../store/auth.store.js';
import BuilderProjectCard from '../components/BuilderProjectCard.jsx';

export default function FavoriteProjects() {
  const { user } = useAuthStore();
  const { getUserFavorites } = useFavoritesStore();
  const navigate = useNavigate();

  const favorites = getUserFavorites(user?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-500 mt-2">
            Your saved builder projects and properties for quick access
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-500 max-w-sm text-center mb-8">
            Click the heart icon on any project card to save it here for future reference.
          </p>
          <button
            onClick={() => navigate('/directory/browse?role=builder')}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Browse Projects
          </button>
        </div>
      ) : (
        // Favorites Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((project) => (
            <BuilderProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
