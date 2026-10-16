import React, { useState } from 'react';
import { api, getErrorMessage } from '../services/api.ts';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>(
    user?.role === 'buyer' ? 'gst_certificate' : 'land_records'
  );
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
      const fileExt = '.' + selected.name.split('.').pop()?.toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setError('Invalid file format. Please upload PDF, PNG, JPG, or JPEG.');
        setFile(null);
        return;
      }

      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        setFile(null);
        return;
      }

      setError(null);
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('title', title.trim() || file.name);

      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccess('Document uploaded and registered successfully!');
        await refreshUser();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-900" />
            <h3 className="font-heading text-base font-bold text-neutral-900">Upload Document</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white focus:outline-emerald-800"
            >
              {user?.role === 'buyer' ? (
                <>
                  <option value="gst_certificate">GST Certificate</option>
                  <option value="company_incorporation">Certificate of Incorporation / MCA CIN</option>
                  <option value="trade_license">APMC / Commercial Trade License</option>
                  <option value="fssai_license">FSSAI Food Safety License</option>
                  <option value="other">Other Official Document</option>
                </>
              ) : (
                <>
                  <option value="land_records">Land Record / Patta / 7/12 Extract</option>
                  <option value="aadhaar_id">Farmer National Identity / Aadhaar</option>
                  <option value="bank_passbook">Bank Passbook / Cancelled Cheque</option>
                  <option value="soil_test_report">Soil Test / Organic Certification</option>
                  <option value="other">Other Farm Certificate</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Document Title / Reference
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 Land Record Khata 44"
              className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-emerald-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Select File (PDF, PNG, JPG, max 10MB)
            </label>
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-5 text-center hover:border-emerald-700 transition-colors cursor-pointer bg-neutral-50/50 relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-950">
                  <FileText className="w-5 h-5 text-emerald-800" />
                  <span className="truncate max-w-[240px]">{file.name}</span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-7 h-7 text-neutral-400 mx-auto" />
                  <p className="text-xs font-medium text-neutral-700">Click or drag file here</p>
                  <p className="text-[11px] text-neutral-400">PDF, PNG, JPG or JPEG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {uploading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Document</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
