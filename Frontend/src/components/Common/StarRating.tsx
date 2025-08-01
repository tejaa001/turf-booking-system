import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'w-5 h-5' }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${size} text-yellow-400 fill-current`} />
      ))}
      {hasHalfStar && <StarHalf key="half" className={`${size} text-yellow-400 fill-current`} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${size} text-gray-300 fill-current`} />
      ))}
    </div>
  );
};

export default StarRating;