'use client';

import { useState } from 'react';

interface LearnMoreButtonProps {
  color: string;
  message?: string;
}

export default function LearnMoreButton({ color, message = 'Please connect your wallet' }: LearnMoreButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    alert(message);
    setIsClicked(true);
  };

  return (
    <button 
      onClick={handleClick} 
      className={`${color} font-medium hover:underline inline-flex items-center`}
    >
      Learn More
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
} 