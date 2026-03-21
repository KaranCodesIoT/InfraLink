import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, MapPin, Briefcase, Plus, X, ArrowLeft, ArrowRight, Loader2, CheckCircle2, User, Camera
} from 'lucide-react';
import ImageCropper from '../../../components/ImageCropper.jsx';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { ROLE_LABELS } from '../../../constants/roles.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

export default function CompleteProfile() {
  const { user, updateProfile, uploadAvatar, isLoading } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: '',
    city: '',
    state: '',
    experience: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [cropperSrc, setCropperSrc] = useState(null);

  // Pre-fill if user already has some data
  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        experience: user.experience || '',
      });
      setSkills(user.skills || []);
      setPhotoUrl(resolveAvatarUrl(user.avatar));
    }
  }, [user]);

  // Guard — if user is individual, redirect to dashboard
  useEffect(() => {
    if (user && user.role === 'normal_user') {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

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
      setCropperSrc(null); // Close modal
      await uploadAvatar(user._id, croppedFile);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!form.city.trim()) newErrors.city = 'City is required.';
    if (!form.state.trim()) newErrors.state = 'State is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      phone: form.phone,
      location: { city: form.city, state: form.state },
      experience: form.experience,
      skills,
    };

    try {
      await updateProfile(user._id, payload);
      toast.success("Profile complete! Welcome to InfraLink 🎉");
      navigate(ROUTES.DASHBOARD);
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Progress */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-gray-400">Choose Role</span>
          </div>
          <div className="flex-1 h-0.5 bg-orange-400 rounded" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-medium text-orange-600">Complete Profile</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Complete your profile</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          You're joining as a <span className="font-semibold text-orange-600">{roleLabel}</span>. 
          Help others find and connect with you.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow sm:rounded-2xl sm:px-10">

          {/* Role badge (read-only, auto-filled) */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl mb-6">
            <Briefcase className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Your Role</p>
              <p className="text-sm font-bold text-gray-900">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.ROLE_SELECT)}
              className="ml-auto text-xs text-orange-600 hover:underline font-medium"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
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
              <p className="mt-2 text-xs font-medium text-gray-500">Upload profile photo</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      errors.state ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Skills (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill, press Enter"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium rounded-full"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                name="experience"
                type="text"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 5 years, 10+ years"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.ROLE_SELECT)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-orange-600 text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
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
