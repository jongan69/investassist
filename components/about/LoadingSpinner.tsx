'use client';

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mb-6"></div>
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-800 dark:text-gray-200">
          Loading Dexscreener data...
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Please wait while we fetch Dexscreener data
        </p>
      </div>
    </div>
  );
} 