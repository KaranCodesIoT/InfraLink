import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, ArrowLeft, Image as ImageIcon, Video, X } from 'lucide-react';
import { useProjectTrackingStore } from '../store/useProjectTrackingStore';

const updateSchema = z.object({
  textNote: z.string().min(5, 'Update note must be at least 5 characters').max(2000),
  hoursWorked: z.number().min(0).max(24).optional(),
});

export default function SubmitUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitUpdate, isUpdatesLoading } = useProjectTrackingStore();
  
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateSchema)
  });

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        setError('Maximum 5 files allowed per update.');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
      setError('');
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    const newCaptions = { ...captions };
    delete newCaptions[index];
    setCaptions(newCaptions);
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      
      const formData = new FormData();
      formData.append('textNote', data.textNote);
      if (data.hoursWorked) {
        formData.append('hoursWorked', data.hoursWorked);
      }
      
      files.forEach((file, index) => {
        formData.append('media', file);
        formData.append(`mediaCaptions[${index}]`, captions[index] || '');
      });

      await submitUpdate(id, formData);
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit update');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(`/projects/${id}`)}
          className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Daily Update</h1>
          <p className="text-gray-600 text-sm mt-1">Document your progress for today. Max 1 update per day.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you work on today? <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('textNote')}
              rows="4"
              placeholder="Describe the tasks completed, current status, and any blockers..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            ></textarea>
            {errors.textNote && <p className="mt-1 text-sm text-red-600">{errors.textNote.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours Worked (Optional)
            </label>
            <input
              type="number"
              step="0.5"
              {...register('hoursWorked', { valueAsNumber: true })}
              placeholder="e.g. 8"
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
            {errors.hoursWorked && <p className="mt-1 text-sm text-red-600">{errors.hoursWorked.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos & Videos (Max 5)
            </label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 px-2 py-1">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*,video/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 50MB</p>
              </div>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      {file.type.startsWith('video') ? (
                        <Video className="h-6 w-6 text-indigo-500" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <input
                        type="text"
                        placeholder="Add a caption... (optional)"
                        value={captions[index] || ''}
                        onChange={(e) => setCaptions({...captions, [index]: e.target.value})}
                        className="mt-2 w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatesLoading}
              className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isUpdatesLoading ? 'Submitting...' : 'Submit Daily Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
