import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, IndianRupee, CalendarDays, ShieldCheck, CheckCircle, Image as ImageIcon, Send, Loader2, Edit3, Check, X, ArrowLeft, Trash2, Settings, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../../store/auth.store';
import useBuilderProjectStore from '../../../store/builderProject.store';
import useFavoritesStore from '../../../store/favorites.store';
import useUIStore from '../../../store/ui.store';

export default function BuilderProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  const { fetchProjectById, currentProject, isLoading, addUpdate, uploadMedia, updateProject, deleteProject, isSubmitting } = useBuilderProjectStore();
  
  // Modals & Delete Logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const [updateText, setUpdateText] = useState('');
  const [updateFiles, setUpdateFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Pagination for updates
  const [visibleUpdatesCount, setVisibleUpdatesCount] = useState(3);

  // Editable Units
  const [isEditingUnits, setIsEditingUnits] = useState(false);
  const [editUnitsVal, setEditUnitsVal] = useState('');
  const [isSavingUnits, setIsSavingUnits] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectById(id).catch(() => {
        toast.error('Failed to load project details');
      });
    }
  }, [id, fetchProjectById, toast]);

  if (isLoading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const project = currentProject;
  const isOwner = user?._id === project.builder?._id || user?._id === project.builder;

  // --- Image Replace Logic ---
  const handleImageReplace = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length < 3) {
      toast.error('At least 3 images are required for a project');
      return;
    }
    
    try {
      setIsUploading(true);
      const newImageUrls = await uploadMedia(files);
      await updateProject(project._id, { images: newImageUrls });
      toast.success('Project images updated successfully');
    } catch (error) {
      toast.error('Failed to update images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }
    try {
      await deleteProject(project._id, deleteReason);
      toast.success('Project deleted successfully');
      // Cleanup locally cached favorites gracefully
      if (useFavoritesStore.getState().isFavorite(user?._id, project._id)) {
        useFavoritesStore.getState().toggleFavorite(user?._id, project);
      }
      setShowDeleteModal(false);
      navigate('/dashboard'); // Navigate home/dashboard after deletion
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  // --- Units Update Logic ---
  const handleSaveUnits = async () => {
    const val = Number(editUnitsVal);
    if (isNaN(val) || val < 0 || val > project.totalUnits) {
      toast.error(`Units must be between 0 and ${project.totalUnits}`);
      return;
    }

    try {
      setIsSavingUnits(true);
      await updateProject(project._id, { availableUnits: val });
      toast.success('Available units updated');
      setIsEditingUnits(false);
    } catch (error) {
      toast.error('Failed to update units');
    } finally {
      setIsSavingUnits(false);
    }
  };

  // --- Updates Logic ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + updateFiles.length > 5) {
      toast.error('Maximum 5 files allowed per update');
      return;
    }
    setUpdateFiles((prev) => [...prev, ...files]);
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim() && updateFiles.length === 0) return;

    try {
      setIsUploading(true);
      let mediaUrls = [];
      if (updateFiles.length > 0) {
        mediaUrls = await uploadMedia(updateFiles);
      }

      await addUpdate(id, {
        text: updateText.trim(),
        media: mediaUrls
      });

      toast.success('Project update posted!');
      setUpdateText('');
      setUpdateFiles([]);
    } catch (error) {
      toast.error('Failed to post update');
    } finally {
      setIsUploading(false);
    }
  };

  const sortedUpdates = [...(project.updates || [])].reverse();
  const visibleUpdates = sortedUpdates.slice(0, visibleUpdatesCount);
  const hasMoreUpdates = visibleUpdatesCount < sortedUpdates.length;

  const handleSeeMore = () => {
    setVisibleUpdatesCount((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.projectName}</h1>
              <div className="flex items-center gap-2">
                {project.projectStatus === 'Ready to Move' || project.projectStatus === 'Completed' ? (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    {project.projectStatus}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    {project.projectStatus}
                  </span>
                )}
              </div>
            </div>
            
            {/* Owner Action Buttons */}
            {isOwner && (
              <div className="flex items-center gap-2 mt-3 mb-4">
                <button 
                  onClick={() => toast.info('Detailed edit mode coming soon!')}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition"
                >
                  <Settings className="w-3.5 h-3.5" /> Edit Project
                </button>
                {(project.projectStatus !== 'Ready to Move' && project.projectStatus !== 'Completed') && (
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Project
                  </button>
                )}
              </div>
            )}

            <p className="text-gray-500 flex items-center gap-1.5 md:text-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              {project.area}, {project.city}
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-sm text-gray-500 uppercase font-semibold">Price Starts</span>
            <p className="text-2xl font-bold text-gray-900 flex items-center md:justify-end">
              <IndianRupee className="w-5 h-5 mr-1" />
              {project.price?.toLocaleString('en-IN') || 'On Request'}
            </p>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100 relative group">
          
          {isOwner && (
            <div className="absolute top-8 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer bg-white/90 backdrop-blur-md text-gray-800 shadow-lg border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-orange-600" /> : <Edit3 className="w-4 h-4 text-gray-600" />}
                {isUploading ? 'Uploading...' : 'Replace Images'}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageReplace} 
                  disabled={isUploading}
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 md:h-96">
            {project.images && project.images.length > 0 ? (
              <>
                <div className="h-full w-full rounded-xl overflow-hidden relative">
                  <img src={project.images[0]} alt="Main" className="w-full h-full object-cover" />
                  {project.reraNumber && (
                    <span className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 shadow-xl text-white backdrop-blur-md">
                      <ShieldCheck className="w-4 h-4" /> RERA Approved
                    </span>
                  )}
                </div>
                {project.images.length > 1 && (
                  <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full hidden md:grid">
                    {project.images.slice(1, 5).map((img, idx) => (
                      <div key={idx} className="h-full w-full rounded-xl overflow-hidden bg-gray-100">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <Building2 className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-xs text-gray-400 uppercase font-semibold mb-1">Configuration</span>
            <span className="text-sm font-bold text-gray-900">{project.configuration}</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <Building2 className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-xs text-gray-400 uppercase font-semibold mb-1">Property Type</span>
            <span className="text-sm font-bold text-gray-900 capitalize">{project.propertyType}</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center relative group">
            <CheckCircle className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-xs text-gray-400 uppercase font-semibold mb-1">Available Units</span>
            
            {isEditingUnits ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="number" 
                  value={editUnitsVal} 
                  onChange={(e) => setEditUnitsVal(e.target.value)}
                  className="w-16 text-center text-sm font-bold text-gray-900 border border-gray-300 rounded-md py-1 px-1 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <span className="text-sm font-bold text-gray-900">/ {project.totalUnits}</span>
                <div className="flex items-center gap-1">
                  <button onClick={handleSaveUnits} disabled={isSavingUnits} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                    {isSavingUnits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsEditingUnits(false)} disabled={isSavingUnits} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                {project.availableUnits} / {project.totalUnits}
                {isOwner && (
                  <button 
                    onClick={() => { setEditUnitsVal(String(project.availableUnits)); setIsEditingUnits(true); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-orange-600"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <CalendarDays className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-xs text-gray-400 uppercase font-semibold mb-1">Possession</span>
            <span className="text-sm font-bold text-gray-900">
              {project.possessionDate ? new Date(project.possessionDate).getFullYear() : 'Ongoing'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this Project</h2>
            <div className="prose prose-sm md:prose-base text-gray-600 max-w-none whitespace-pre-wrap">
              {project.description}
            </div>
          </div>

          {(project.amenities?.length > 0 || project.nearbyFacilities?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities & Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {project.amenities?.map((a, i) => (
                  <span key={`am-${i}`} className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-700">
                    {a}
                  </span>
                ))}
                {project.nearbyFacilities?.map((f, i) => (
                  <span key={`nf-${i}`} className="px-3 py-1.5 rounded-lg text-sm bg-indigo-50 border border-indigo-100 text-indigo-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Updates Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-600" />
              Project Updates
            </h2>

            {/* View Updates */}
            <div className="space-y-6">
              {visibleUpdates.length > 0 ? (
                <>
                  {visibleUpdates.map((update, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="absolute w-3 h-3 bg-orange-500 rounded-full outline outline-4 outline-white -left-[7px] top-1"></div>
                      <div className="text-sm text-gray-500 mb-1 font-medium">
                        {new Date(update.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
                        {update.text}
                      </p>
                      {update.media && update.media.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {update.media.map((url, i) => (
                            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              {url.endsWith('.mp4') || url.endsWith('.mov') ? (
                                <video src={url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={url} alt="Update media" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {hasMoreUpdates && (
                    <div className="pt-2">
                      <button 
                        onClick={handleSeeMore}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 hover:text-orange-600 transition-colors"
                      >
                        See More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No updates posted yet.
                </div>
              )}
            </div>
            
            {/* Add Update Form (OWNER ONLY) */}
            {isOwner && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Add New Status Update</h3>
                <form onSubmit={submitUpdate}>
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="What's the latest progress?"
                    className="w-full rounded-xl border border-gray-200 text-sm shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500 resize-none outline-none"
                    rows={3}
                  />
                  
                  {updateFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {updateFiles.map((f, i) => (
                        <div key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200 truncate max-w-[120px]">
                          {f.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <label className="cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition border border-gray-200">
                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                        <ImageIcon className="w-4 h-4" />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isUploading || isSubmitting || (!updateText.trim() && updateFiles.length === 0)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                    >
                      {(isUploading || isSubmitting) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Post Update
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project</h3>
              <p className="text-gray-500 text-sm mb-4">
                Are you sure you want to permanently delete <strong>{project.projectName}</strong>? This action cannot be undone. All related updates and gallery images will be cleared.
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., Sold to another developer, Canceled..."
                  className="w-full rounded-xl border border-gray-200 shadow-sm p-3 text-sm focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteReason(''); }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProject}
                disabled={!deleteReason.trim() || isSubmitting}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
