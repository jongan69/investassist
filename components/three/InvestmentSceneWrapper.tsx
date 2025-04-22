'use client';

import dynamic from 'next/dynamic';

// Dynamically import the InvestmentScene component with no SSR
const InvestmentScene = dynamic(() => import('./InvestmentScene'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl"><p className="text-gray-500">The Future is Loading...</p></div>
});

export default function InvestmentSceneWrapper() {
  return (
    <div className="mb-12 rounded-xl overflow-hidden shadow-xl">
      <InvestmentScene />
    </div>
  );
} 