import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import StarRatingInput from './StarRatingInput';

interface ReviewModalProps {
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  loading: boolean;
  apiError: string | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ onClose, onSubmit, loading, apiError }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (review.trim() === '') {
      setError('Please write a review to help others.');
      return;
    }
    setError(null);
    await onSubmit(rating, review);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md relative transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Write a Review
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Your Rating
            </label>
            <div className="flex justify-center">
              <StarRatingInput rating={rating} setRating={setRating} />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="review-text"
              rows={5}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your experience, what you liked, and what could be improved..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              required
            />
          </div>
          
          {(error || apiError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error || apiError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
