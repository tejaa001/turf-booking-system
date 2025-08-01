import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: string;
  color?: string;
  hoverColor?: string;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  rating,
  setRating,
  size = 'w-8 h-8',
  color = 'text-gray-300',
  hoverColor = 'text-yellow-400',
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;

        return (
          <button
            type="button"
            key={ratingValue}
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 rounded-sm"
          >
            <Star
              className={`${size} transition-colors ${
                ratingValue <= (hover || rating) ? hoverColor : color
              }`}
              fill={ratingValue <= (hover || rating) ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;