import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CancellationModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
  apiError: string | null;
}

const CancellationModal: React.FC<CancellationModalProps> = ({ onClose, onConfirm, loading, apiError }) => {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleConfirmClick = async () => {
    if (!reason.trim()) {
      setValidationError('Please provide a reason for cancellation.');
      return;
    }
    setValidationError('');
    await onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Confirm Cancellation</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this booking? This action cannot be undone. Please provide a reason for cancellation.
          </p>
          <div>
            <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation
            </label>
            <textarea
              id="cancellationReason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Change of plans, weather conditions..."
            />
            {validationError && <p className="text-xs text-red-600 mt-1">{validationError}</p>}
          </div>
          {apiError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md" role="alert">
              {apiError}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Go Back</button>
          <button type="button" onClick={handleConfirmClick} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400 flex items-center">
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;