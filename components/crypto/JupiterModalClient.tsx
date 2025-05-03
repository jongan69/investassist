'use client';
import { useState } from 'react';
import JupiterTerminalPopup from '@/components/crypto/JupiterPopup';

export default function JupiterModalClient({ contractAddress, buttonText }: { contractAddress: string, buttonText?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
      <JupiterTerminalPopup
        contractAddress={contractAddress}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        buttonText={buttonText}
      />
  );
}