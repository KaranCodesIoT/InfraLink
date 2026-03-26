import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';
import useAuth from '../../../hooks/useAuth.js';
import useBuilderProjectStore from '../../../store/builderProject.store.js';
import useUIStore from '../../../store/ui.store.js';
import StepIndicator from '../components/StepIndicator.jsx';
import StepBasicInfo from '../components/StepBasicInfo.jsx';
import StepPricingUnits from '../components/StepPricingUnits.jsx';
import StepMediaUpload from '../components/StepMediaUpload.jsx';
import StepTrustDetails from '../components/StepTrustDetails.jsx';
import StepPreviewSubmit from '../components/StepPreviewSubmit.jsx';
import AccessDenied from '../components/AccessDenied.jsx';

const TOTAL_STEPS = 5;

// ── Per-step validators ─────────────────────────────────────────────────────
const validators = [
  // Step 0 – Basic Info
  (d) => {
    const e = {};
    if (!d.projectName?.trim()) e.projectName = 'Project name is required';
    if (!d.city) e.city = 'City is required';
    if (!d.area?.trim()) e.area = 'Area is required';
    if (!d.propertyType) e.propertyType = 'Select property type';
    if (!d.configuration) e.configuration = 'Select configuration';
    if (!d.projectStatus) e.projectStatus = 'Select project status';
    return e;
  },
  // Step 1 – Pricing
  (d) => {
    const e = {};
    if (!d.price || Number(d.price) <= 0) e.price = 'Enter a valid price';
    if (!d.totalUnits || Number(d.totalUnits) < 1) e.totalUnits = 'Enter total units';
    if (d.availableUnits === '' || d.availableUnits === undefined || Number(d.availableUnits) < 0)
      e.availableUnits = 'Enter available units';
    return e;
  },
  // Step 2 – Media
  (d) => {
    const e = {};
    if (!d._imageFiles || d._imageFiles.length < 3) e.images = 'Upload at least 3 images';
    if (!d.description?.trim()) e.description = 'Description is required';
    return e;
  },
  // Step 3 – Trust (all optional — no blocking validation)
  () => ({}),
  // Step 4 – Preview (validated client-side already)
  () => ({}),
];

export default function PostBuilderProject() {
  const { isBuilder } = useAuth();
  const navigate = useNavigate();
  const { toast } = useUIStore();
  const { createProject, uploadMedia, isSubmitting } = useBuilderProjectStore();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  if (!isBuilder) return <AccessDenied />;

  // ── Navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    const errs = validators[step](formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      // 1. Upload images
      let imageUrls = [];
      if (formData._imageFiles?.length) {
        imageUrls = await uploadMedia(formData._imageFiles);
      }

      // 2. Upload video
      let videoUrl = '';
      if (formData._videoFile) {
        const [url] = await uploadMedia([formData._videoFile]);
        videoUrl = url;
      }

      // 3. Build payload (strip internal keys)
      const payload = {
        projectName: formData.projectName,
        city: formData.city,
        area: formData.area,
        propertyType: formData.propertyType,
        configuration: formData.configuration,
        projectStatus: formData.projectStatus,
        price: Number(formData.price),
        totalUnits: Number(formData.totalUnits),
        availableUnits: Number(formData.availableUnits),
        possessionDate: formData.possessionDate || null,
        images: imageUrls,
        video: videoUrl || undefined,
        description: formData.description,
        reraNumber: formData.reraNumber || undefined,
        amenities: formData.amenities || [],
        nearbyFacilities: formData.nearbyFacilities || [],
      };

      setIsUploading(false);
      await createProject(payload);
      toast.success('Project published successfully! 🎉');
      navigate(ROUTES.PROJECTS);
    } catch (e) {
      setIsUploading(false);
      toast.error(e.response?.data?.message || 'Failed to publish project');
    }
  };

  // ── Render current step ────────────────────────────────────────────────
  const stepComponents = [
    <StepBasicInfo key={0} data={formData} onChange={setFormData} errors={errors} />,
    <StepPricingUnits key={1} data={formData} onChange={setFormData} errors={errors} />,
    <StepMediaUpload key={2} data={formData} onChange={setFormData} errors={errors} />,
    <StepTrustDetails key={3} data={formData} onChange={setFormData} errors={errors} />,
    <StepPreviewSubmit key={4} data={formData} isSubmitting={isSubmitting || isUploading} onSubmit={handleSubmit} />,
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a Project</h1>
        <p className="text-sm text-gray-500 mt-1">List your property project and reach thousands of buyers</p>
      </div>

      <StepIndicator currentStep={step} />

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {stepComponents[step]}

        {/* Navigation Buttons */}
        {step < TOTAL_STEPS - 1 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 transition shadow-sm"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
