import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, MapPin, Mail, Briefcase, Save, ArrowLeft, X, Plus, Loader2, Camera
} from 'lucide-react';
import ImageCropper from '../../../components/ImageCropper.jsx';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { ROLES, ROLE_LABELS } from '../../../constants/roles.js';

// Roles users can self-assign (exclude admin and unassigned)
const SELECTABLE_ROLES = [
  ROLES.NORMAL_USER,
  ROLES.BUILDER,
  ROLES.CONTRACTOR,
  ROLES.ARCHITECT,
  ROLES.LABOUR,
  ROLES.SUPPLIER,
  ROLES.WORKER,
];

export default function EditProfile() {
  const { user, updateProfile, uploadAvatar, isLoading } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    role: '',
    experience: '',
    bio: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [cropperSrc, setCropperSrc] = useState(null);

  // Pre-fill form with current user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        address: user.location?.address || '',
        role: (user.role && user.role !== 'unassigned') ? user.role : '',
        experience: user.experience || '',
        bio: user.bio || '',
      });
      setSkills(user.skills || []);
      setPhotoUrl(user.avatar || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setCropperSrc(URL.createObjectURL(file));
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      setCropperSrc(null);
      await uploadAvatar(user._id, croppedFile);
      toast.success('Profile photo updated successfully!');
      setPhotoUrl(URL.createObjectURL(croppedFile));
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Full name is required.');
      return;
    }

    const payload = {
      name: form.name,
      phone: form.phone,
      location: {
        city: form.city,
        state: form.state,
        address: form.address,
      },
      experience: form.experience,
      bio: form.bio,
      skills,
    };
    if (form.role) payload.role = form.role;

    try {
      await updateProfile(user._id, payload);
      toast.success('Profile updated successfully!');
      navigate(ROUTES.PROFILE);
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500">Update your professional information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-center sm:items-start">
            {/* Avatar Upload */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-orange-700 hover:scale-105 transition-all">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            <div className="flex-1 space-y-1 text-center sm:text-left pt-2">
              <h2 className="text-lg font-bold text-gray-900">Profile Photo</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                This image will be shown on your profile and directory card. Square images work best.
              </p>
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed for security reasons.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Mumbai"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, area, landmark"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-500" />
            Professional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
              >
                <option value="">Select your role...</option>
                {SELECTABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Once set, your profile will appear in the Worker Directory under this role.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                name="experience"
                type="text"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 5 years, 10+ years"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
              <textarea
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                placeholder="A brief description of your expertise and what you offer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 text-sm font-medium rounded-lg"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>

      {/* Cropper Modal */}
      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropCompleteAction={handleCropComplete}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </div>
  );
}
