'use client';

import { useState, useEffect } from 'react';

interface ContractAddressProps {
  address: string;
}

export default function ContractAddress({ address }: ContractAddressProps) {
  const [copied, setCopied] = useState(false);
  const [roaring, setRoaring] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const copyToClipboard = async () => {
    if (!isClient) return;

    try {
      // Create temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = address;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);

      // Select the text
      tempInput.select();
      tempInput.setSelectionRange(0, 99999); // For mobile devices

      let success = false;

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        success = true;
      } else {
        // Fallback for older browsers
        success = document.execCommand('copy');
      }

      // Remove temporary element
      document.body.removeChild(tempInput);

      if (!success) {
        throw new Error('Copy failed');
      }

      // Success feedback
      setCopied(true);
      setRoaring(true);

      // Reset states
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setRoaring(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show user-friendly error message
      alert('Please manually copy the address: ' + address);
    }
  };

  return (
    <div
      onClick={copyToClipboard}
      className={`bg-white/10 p-4 sm:p-4 rounded-lg w-full mx-auto backdrop-blur-sm mt-6 
        cursor-pointer transform transition-all duration-300 active:scale-95 hover:scale-105 
        hover:bg-white/15 relative group ${roaring ? 'animate-shake' : ''}
        touch-manipulation`}
    >
      <div className="text-xs sm:text-sm font-mono break-all relative">
        <span>Contract Address: </span>
        <br />
        <span className="text-yellow-400">
          {address}
        </span>
        <span
          className={`absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 
            px-3 py-1 text-sm rounded-full shadow-lg transition-opacity duration-300 
            ${copied ? 'opacity-100 bg-black' : 'opacity-0'}`}
        >
          HOUSE MODE:
          <br />
          <span className="text-green-500">ENABLED</span>
        </span>
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 
        opacity-100 transition-opacity duration-300 pb-8">
        {copied ? '✅' : '📋'}
      </div>

      {/* house emojis that appear on copy */}
      {roaring && (
        <>
          <span className="absolute -top-4 -left-4 animate-float-up-left text-base sm:text-lg">🏠</span>
          <span className="absolute -top-4 -right-4 animate-float-up-right text-base sm:text-lg">🏠</span>
        </>
      )}
    </div>
  );
} 