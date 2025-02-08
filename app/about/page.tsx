import { Suspense } from "react";
import Leaderboard from "@/components/ui/leaderboard";

export default async function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <Leaderboard />
      </Suspense>
      <br />
      <h1 className="text-3xl font-bold mb-4 dark:text-white">About InvestAssist</h1>
      <p className="mb-4 dark:text-gray-300">
        InvestAssist is a comprehensive platform designed to empower investors with real-time market data, insightful analytics, and personalized investment strategies. Whether you&apos;re a seasoned trader or a beginner, InvestAssist provides the tools and resources you need to make informed investment decisions.
      </p>
      <h2 className="text-2xl font-semibold mb-2 dark:text-white">Use Cases</h2>
      <ul className="list-disc list-inside mb-4 dark:text-gray-300">
        <li>Track real-time stock and crypto market trends.</li>
        <li>Analyze sector performance to identify potential investment opportunities.</li>
        <li>Access the latest financial news and market sentiment analysis.</li>
        <li>Utilize advanced charting tools to visualize market data.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2 dark:text-white">Features</h2>
      <ul className="list-disc list-inside mb-4 dark:text-gray-300">
        <li>Real-time market data and analytics</li>
        <li>Comprehensive market insights and reports</li>
        <li>Professional customer support</li>
        <li>Advanced trading tools and charts</li>
        <li>Purchase AI generated investment plans</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2 dark:text-white">Join Us</h2>
      <p className="dark:text-gray-300">
        Join thousands of investors who trust InvestAssist to guide their investment journey. Sign up today and take control of your financial future with confidence.
      </p>
    </div>
  )
}