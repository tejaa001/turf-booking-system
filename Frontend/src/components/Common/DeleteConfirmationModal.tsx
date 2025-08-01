import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface DeleteConfirmationModalProps {
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  apiError: string | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ itemName, onClose, onConfirm, loading, apiError }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-800">{itemName}</strong>? This action is permanent and cannot be undone.
          </p>
          {apiError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md" role="alert">
              {apiError}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400 flex items-center">
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;