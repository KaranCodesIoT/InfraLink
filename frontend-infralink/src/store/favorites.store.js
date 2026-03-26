import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: {}, // Store structure: { userId: [projectData] }
      
      toggleFavorite: (userId, project) => {
        if (!userId) return;

        set((state) => {
          const userFavs = state.favorites[userId] || [];
          const isFavorited = userFavs.some(p => p._id === project._id);
          
          let updatedFavs;
          if (isFavorited) {
            // Remove it
            updatedFavs = userFavs.filter(p => p._id !== project._id);
          } else {
            // Add it
            updatedFavs = [...userFavs, project];
          }

          return {
            favorites: {
              ...state.favorites,
              [userId]: updatedFavs
            }
          };
        });
      },

      isFavorite: (userId, projectId) => {
        if (!userId) return false;
        const userFavs = get().favorites[userId] || [];
        return userFavs.some(p => p._id === projectId);
      },

      getUserFavorites: (userId) => {
        if (!userId) return [];
        return get().favorites[userId] || [];
      }
    }),
    {
      name: 'infralink-favorites-storage', // unique name
    }
  )
);

export default useFavoritesStore;
