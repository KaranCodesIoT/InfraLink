import { useRef, useState } from 'react';
import { ImagePlus, Video, X, Upload, FileText, Box, Sparkles, Cuboid, Wand2 } from 'lucide-react';

export default function StepMediaUpload({ data, onChange, errors }) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const glbInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // ── Image Files ──────────────────────────────────────────────────────────
  const imageFiles = data._imageFiles || [];
  const imagePreviews = data._imagePreviews || [];

  const handleImageSelect = (files) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    onChange({
      ...data,
      _imageFiles: [...imageFiles, ...newFiles],
      _imagePreviews: [...imagePreviews, ...newPreviews],
    });
  };

  const removeImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    onChange({ ...data, _imageFiles: updatedFiles, _imagePreviews: updatedPreviews });
  };

  // ── GLB 3D Model File ────────────────────────────────────────────────────
  const handleGLBSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.glb')) {
      onChange({ ...data, _glbFile: file, _glbFileName: file.name });
    }
  };
  const removeGLB = () => onChange({ ...data, _glbFile: null, _glbFileName: null });

  // ── Video File ───────────────────────────────────────────────────────────
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      onChange({ ...data, _videoFile: file, _videoPreview: file.name });
    }
  };
  const removeVideo = () => onChange({ ...data, _videoFile: null, _videoPreview: null });

  // ── Drag and drop ────────────────────────────────────────────────────────
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { handleDrag(e); setDragActive(true); };
  const handleDragOut = (e) => { handleDrag(e); setDragActive(false); };
  const handleDrop = (e) => {
    handleDrag(e);
    setDragActive(false);
    if (e.dataTransfer.files) handleImageSelect(e.dataTransfer.files);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all
    ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'}`;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg">
          <ImagePlus className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Media & 3D Experience</h3>
          <p className="text-sm text-gray-500">Showcase your property with stunning visuals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* OPTION 1: Upload Images (Required) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-800">
              1. Upload Images <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">Required</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed -mt-3 mb-2">
            For basic listing presentation. Essential for all property cards.
          </p>

          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-orange-500 bg-orange-50'
                : errors.images
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drag & drop images here, or <span className="text-orange-600 font-medium whitespace-nowrap">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each (min 3)</p>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files)}
          />
          {errors.images && <p className="mt-1 text-xs text-red-500 font-medium">{errors.images}</p>}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] uppercase bg-orange-600 text-white px-1 rounded font-bold">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OPTION 2: Upload 3D Model (.glb) (Optional) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-bold text-gray-800">
              <Sparkles className="w-4 h-4 text-orange-500 mr-1.5" /> 2. Upload 3D Model
            </label>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-md">
              Premium ⭐
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed -mt-3 mb-2">
            Enables the "View in AR" button for buyers. Highly recommended for a premium experience.
          </p>

          {!data._glbFile ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => glbInputRef.current?.click()}
                className="w-full border-2 border-dashed border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Cuboid className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm font-bold text-orange-900 mb-1">Upload .glb File</p>
                <p className="text-xs text-orange-600/70">Click to upload your architectural 3D model</p>
              </button>

              {/* Startup Upsell Banner */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-2xl relative overflow-hidden shadow-lg border border-indigo-700/50">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-purple-300" /> Convert Images to 3D
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">
                      Paid Feature
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                    Don't have a 3D model? Let our AI experts generate a stunning interactive .glb layout directly from your 2D floor plans. Stand out from the competition!
                  </p>
                  <button type="button" className="w-full bg-white text-indigo-900 text-xs font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-md flex items-center justify-center gap-1.5">
                    Request 3D Conversion <span className="text-indigo-500 font-normal ml-1">₹500 - ₹2000</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                AR Enabled
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <Box className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{data._glbFileName}</p>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" /> Ready for immersive view
                  </p>
                </div>
                <button type="button" onClick={removeGLB} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <input ref={glbInputRef} type="file" accept=".glb" className="hidden" onChange={handleGLBSelect} />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Video & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Video className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Optional Walkthrough Video
          </label>
          {data._videoPreview ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Video className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate flex-1">{data._videoPreview}</span>
              <button type="button" onClick={removeVideo} className="text-red-500 hover:text-red-700 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition hover:text-indigo-600 font-medium"
            >
              + Upload an MP4 video
            </button>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-800 mb-1.5">
            <FileText className="w-4 h-4 inline mr-1 text-orange-500" /> Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={4}
            placeholder="Describe your project — layout, amenities, neighbourhood highlights…"
            className={inputClass('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
}
