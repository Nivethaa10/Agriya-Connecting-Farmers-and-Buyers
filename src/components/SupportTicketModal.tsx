import React, { useState } from 'react';
import { api, getErrorMessage } from '../services/api.ts';
import { X, LifeBuoy, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('contract_inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      setError('Please provide both subject and message.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await api.post('/support', {
        subject,
        category,
        message,
      });

      if (res.data.success) {
        setSuccess('Support ticket created successfully. Support team will respond shortly.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 900);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-emerald-900" />
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Submit Support Inquiry
            </h3>
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
              Inquiry Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Clarification regarding moisture test threshold"
              className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-emerald-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white focus:outline-emerald-800"
            >
              <option value="contract_inquiry">Contract Terms & Schedule Inquiry</option>
              <option value="payment_issue">Payment & Settlement Query</option>
              <option value="crop_dispute">Quality & Grading Assessment Dispute</option>
              <option value="verification_query">Buyer Business Verification Query</option>
              <option value="technical_support">Technical Portal Support</option>
              <option value="other">General Grievance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your query or dispute with contract references or dates..."
              className="w-full text-xs rounded-lg border border-neutral-300 p-3 text-neutral-900 focus:outline-emerald-800"
              required
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
            >
              {submitting ? 'Submitting...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
