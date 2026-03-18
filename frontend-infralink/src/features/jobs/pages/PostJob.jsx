import { useNavigate } from 'react-router-dom';
import useJobStore from '../../../store/job.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import JobForm from '../components/JobForm.jsx';

export default function PostJob() {
  const { createJob, isLoading } = useJobStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      await createJob(payload);
      toast.success('Job posted successfully!');
      navigate(ROUTES.JOBS);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post job');
    }
  };

  return <JobForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
