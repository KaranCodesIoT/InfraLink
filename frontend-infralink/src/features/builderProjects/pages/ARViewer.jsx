import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Maximize2, Share2, AlertCircle } from 'lucide-react';
import useBuilderProjectStore from '../../../store/builderProject.store.js';
import '@google/model-viewer';

export default function ARViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProjectById, isLoading, error } = useBuilderProjectStore();

  useEffect(() => {
    fetchProjectById(id);
  }, [id, fetchProjectById]);

  // Provide a stylish fallback if no project is found
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/projects')}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-medium transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Provide a stylish fallback if no AR model exists yet
  if (!isLoading && currentProject && !currentProject.arModelUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-4 border-orange-500 rounded-full flex items-center justify-center bg-gray-900 z-10">
            <Maximize2 className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">3D Model Unavailable</h1>
        <p className="text-gray-400 mb-8 max-w-sm">
          No 3D/AR model has been uploaded for <b>{currentProject.projectName}</b> yet.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30"
        >
          Return to Project
        </button>
      </div>
    );
  }

  const modelUrl = currentProject?.arModelUrl;

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col">
      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-white font-bold text-lg leading-tight px-4 max-w-[200px] sm:max-w-xs truncate">
            {currentProject?.projectName || 'Loading...'}
          </h2>
          <p className="text-white/60 text-xs truncate">Interactive 3D View</p>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${currentProject?.projectName} 3D View`,
                url: window.location.href,
              });
            }
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Model Viewer Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-white/70 font-medium">Loading Project Data...</p>
          </div>
        )}

        {modelUrl && (
          <model-viewer
            src={modelUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            auto-rotate-delay="3000"
            rotation-per-second="30deg"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1.2"
            alt={`3D Model of ${currentProject.projectName}`}
            style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}
          >
            {/* Custom AR Button for mobile browsers */}
            <div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
              slot="ar-button"
            >
              <Maximize2 className="w-5 h-5" />
              View in your space
            </div>
          </model-viewer>
        )}
      </div>
    </div>
  );
}
