"use client"

import { useWallet } from '@solana/wallet-adapter-react';
import React, { useState } from 'react';

function SmsSignupForm() {
  const wallet = useWallet();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (consent && phoneNumber && wallet.publicKey) {
      // Submit logic here (e.g., API call to register number)
      const walletAddress = wallet.publicKey.toString()
      fetch('/api/submit-phone', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, phoneNumber })
      })
      setSubmitted(true);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="shadow-lg rounded-lg p-6 w-full max-w-md">
        {wallet.publicKey ? (
          submitted ? (
            <div className="text-center text-lg font-semibold text-green-600">
              Thank you for signing up for SMS alerts!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={() => setConsent(!consent)}
                  required
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-gray-700">I consent to receiving SMS notifications from this service.</label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </button>
            </form>
          )
        ) : (
          <div className="text-center text-gray-700 font-medium">
            Connect your wallet in order to sign up for SMS alerts
          </div>
        )}
      </div>
    </div>
  );
}

export default SmsSignupForm;

