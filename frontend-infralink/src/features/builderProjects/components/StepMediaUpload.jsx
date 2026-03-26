import { useRef, useState } from 'react';
import { ImagePlus, Video, X, Upload, FileText } from 'lucide-react';

export default function StepMediaUpload({ data, onChange, errors }) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // ── Image Files (local File objects stored alongside URLs) ──────────────
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

  // ── Video File ─────────────────────────────────────────────────────────
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      onChange({ ...data, _videoFile: file, _videoPreview: file.name });
    }
  };
  const removeVideo = () => onChange({ ...data, _videoFile: null, _videoPreview: null });

  // ── Drag and drop ──────────────────────────────────────────────────────
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
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <ImagePlus className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Media Upload</h3>
          <p className="text-sm text-gray-500">Showcase your project with images and video</p>
        </div>
      </div>

      {/* Image Upload Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Project Images * <span className="text-gray-400 font-normal">(min 3)</span>
        </label>
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
            Drag & drop images here, or <span className="text-orange-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageSelect(e.target.files)}
        />
        {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
      </div>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded-md font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Video className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Project Video
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        {data._videoPreview ? (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Video className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1">{data._videoPreview}</span>
            <button type="button" onClick={removeVideo} className="text-red-500 hover:text-red-700 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition"
          >
            + Add a walkthrough video
          </button>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoSelect}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <FileText className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Description *
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={4}
          placeholder="Describe your project — layout, amenities, neighbourhood highlights…"
          className={inputClass('description')}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>
    </div>
  );
}
