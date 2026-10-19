import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 15, showScore = true }) => {
  const roundedRating = Math.round(rating * 10) / 10;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = roundedRating >= star;
          const isHalf = !isFilled && roundedRating >= star - 0.5;

          return (
            <Star
              key={star}
              size={size}
              fill={isFilled ? '#f59e0b' : isHalf ? '#fde68a' : '#e2e8f0'}
              color={isFilled || isHalf ? '#f59e0b' : '#cbd5e1'}
            />
          );
        })}
      </div>
      {showScore && (
        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
          {roundedRating > 0 ? roundedRating : 'New'}
        </span>
      )}
      {numReviews !== undefined && (
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
