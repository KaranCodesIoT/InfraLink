import React, { useState, useRef } from 'react';
import { X, Search, MapPin, Calendar, Briefcase, Camera, Video, FileText, CheckCircle2, AlertTriangle, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import api from '../../../lib/axios.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

const PROJECT_TYPES = ['Residential', 'Commercial', 'Interior', 'Infrastructure', 'Renovation', 'Other'];
const ROLE_OPTIONS = ['Builder', 'Contractor', 'Architect', 'Supervisor', 'Other'];
const MEDIA_CATEGORIES = [
    { value: 'site_work', label: 'Site Work' },
    { value: 'final_output', label: 'Final Output' },
    { value: 'before_after', label: 'Before / After' },
    { value: 'blueprint_document', label: 'Blueprint / Document' },
];

export default function AddProjectModal({ isOpen, onClose, onSuccess, isOfflineMode = false, onOfflineSubmit, endpoint = '/builders/projects' }) {
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        projectType: 'Residential',
        location: '',
        completionYear: new Date().getFullYear(),
        role: 'Builder',
        description: '',
    });

    // Media State
    const [mediaItems, setMediaItems] = useState([]);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    // Legal State
    const [legal, setLegal] = useState({
        contentOwnership: false,
        genuineProject: false,
        noCopyrightViolation: false,
        acceptsConsequences: false,
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLegalChange = (e) => {
        const { name, checked } = e.target;
        setLegal(prev => ({ ...prev, [name]: checked }));
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploadingMedia(true);
        setError(null);

        try {
            const formDataToUpload = new FormData();
            files.forEach(file => {
                formDataToUpload.append('media', file); // We'd need a generic upload endpoint. For now we use the general upload endpoint if it exists, or adapt.
                // Actually the backend builder route doesn't have a direct media upload yet, we should use the global upload endpoint.
            });

            const response = await api.post('/upload', formDataToUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Axios gives us response.data, which is { success: true, data: { urls: [...] } }
            const payloadData = response.data?.data || {};
            const urls = payloadData.urls || (payloadData.url ? [payloadData.url] : []);
            
            if (urls.length === 0) {
                throw new Error('No URLs returned from server');
            }

            const newMedia = urls.map(url => ({
                url,
                caption: '',
                category: 'final_output',
                type: url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : url.match(/\.(pdf|doc|docx)$/i) ? 'document' : 'image',
                previewUrl: url // Local preview if possible, but cloud URL is fine
            }));

            setMediaItems(prev => [...prev, ...newMedia]);
        } catch (err) {
            console.error("Upload error details:", err);
            setError(err.response?.data?.error?.message || err.message || 'Failed to upload media');
        } finally {
            setIsUploadingMedia(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const updateMediaItem = (index, field, value) => {
        setMediaItems(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const removeMediaItem = (index) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const isFormValid = () => {
        const hasBasicInfo = formData.title && formData.description && formData.location;
        const hasMediaCaptions = mediaItems.every(m => m.caption.trim());
        const actsLegal = Object.values(legal).every(Boolean);
        return hasBasicInfo && hasMediaCaptions && actsLegal;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                media: mediaItems,
                legalDeclaration: legal
            };

            if (isOfflineMode && onOfflineSubmit) {
                onOfflineSubmit(payload);
                if (onSuccess) onSuccess();
                onClose();
                return;
            }

            await api.post(endpoint, payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add project');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Project</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Showcase your past work to build trust with clients.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Section 1: Details */}
                        <div className="space-y-5">
                            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-orange-500" /> Project Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Luxury Villa Construction in Andheri"
                                        className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                    <select
                                        name="projectType"
                                        value={formData.projectType}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm"
                                    >
                                        {PROJECT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm"
                                    >
                                        {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (City) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="location"
                                            required
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Mumbai, MH"
                                            className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm pl-9"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Year</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            name="completionYear"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            value={formData.completionYear}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Description <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-2">What was your exact role? What work did you complete? Mention any special features or challenges overcome.</p>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the project scope and your contribution..."
                                        className="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-sm custom-scrollbar"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Media */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-orange-500" /> Media & Attachments
                                </h3>
                                <span className="text-xs text-gray-500">{mediaItems.length} / 10 added</span>
                            </div>

                            {/* Media List */}
                            {mediaItems.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {mediaItems.map((media, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                                            <button 
                                                type="button" 
                                                onClick={() => removeMediaItem(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="h-32 w-full bg-gray-200 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                                                {media.type === 'image' ? (
                                                    <img src={resolveAvatarUrl(media.url)} className="w-full h-full object-cover" alt="" />
                                                ) : media.type === 'video' ? (
                                                    <div className="w-full h-full bg-black flex items-center justify-center text-white">
                                                      <Video className="w-8 h-8 opacity-50" />
                                                    </div>
                                                ) : (
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        placeholder="Add caption (required)" 
                                                        value={media.caption}
                                                        onChange={(e) => updateMediaItem(idx, 'caption', e.target.value)}
                                                        className="w-full text-sm rounded-lg border-gray-300 bg-white px-2.5 py-1.5 focus:border-orange-500 shadow-sm"
                                                    />
                                                </div>
                                                <select
                                                    value={media.category}
                                                    onChange={(e) => updateMediaItem(idx, 'category', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 bg-white px-2.5 py-1.5 text-gray-600 focus:border-orange-500 shadow-sm"
                                                >
                                                    {MEDIA_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Button */}
                            {mediaItems.length < 10 && (
                                <div 
                                    onClick={() => !isUploadingMedia && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                        isUploadingMedia ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50/50 bg-gray-50/50'
                                    }`}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*,video/*,.pdf"
                                        onChange={handleFileUpload}
                                    />
                                    {isUploadingMedia ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                                            <p className="text-sm font-medium text-gray-700">Uploading media...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                                            <p className="text-sm font-medium text-gray-900 mb-1">Click to upload images, videos, or documents</p>
                                            <p className="text-xs text-gray-500">Supported: JPG, PNG, MP4, PDF (max 10 files)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Section 3: Legal Declaration */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-4 h-4" /> Legal Declaration & Verification <span className="text-red-500">*</span>
                                </h3>
                                <p className="text-xs text-red-600/80 mb-4 font-medium uppercase tracking-wider">You must agree to all terms before publishing</p>
                                
                                <div className="space-y-3">
                                    {[
                                        { key: 'contentOwnership', label: 'I confirm this content belongs to me or I have explicit permission to share it on this platform.' },
                                        { key: 'genuineProject', label: 'This project was genuinely completed or actively worked on by me or my company.' },
                                        { key: 'noCopyrightViolation', label: 'No copyrighted, trademarked, or third-party confidential material is included without consent.' },
                                        { key: 'acceptsConsequences', label: 'I understand that uploading false claims, fake documents, or stolen images will lead to permanent account suspension.' },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-red-50/80 cursor-pointer transition-colors">
                                            <div className="flex items-center h-5 mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    name={item.key}
                                                    checked={legal[item.key]}
                                                    onChange={handleLegalChange}
                                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                            </div>
                                            <span className="text-sm text-gray-700 leading-snug">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="project-form"
                        disabled={!isFormValid() || isSubmitting || isUploadingMedia}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Publish Project</>
                        )}
                    </button>
                </div>
                
            </div>
        </div>
    );
}
