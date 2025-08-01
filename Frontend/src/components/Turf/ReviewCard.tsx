import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { Review } from '../../types';
import StarRating from '../Common/StarRating';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-start mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
          <UserIcon className="w-6 h-6 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</p>
              <p className="text-xs text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
            <StarRating rating={review.rating} size="w-4 h-4" />
          </div>
          <p className="text-gray-700 mt-2">{review.review}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;