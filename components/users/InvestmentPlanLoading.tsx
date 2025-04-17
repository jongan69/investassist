'use client'

import React, { useState, useEffect } from 'react';
import { SpinnerWithProgress } from "@/components/ui/spinner-with-progress";
import { Card, CardContent } from "@/components/ui/card";

// Define the phases of investment plan generation outside the component
const INVESTMENT_PLAN_PHASES = [
  {
    name: "Market Analysis",
    messages: [
      "Analyzing current market conditions...",
      "Evaluating market sentiment...",
      "Processing market trends...",
    ],
    progressRange: [0, 25],
  },
  {
    name: "Portfolio Assessment",
    messages: [
      "Evaluating your current holdings...",
      "Calculating portfolio metrics...",
      "Identifying diversification opportunities...",
    ],
    progressRange: [25, 50],
  },
  {
    name: "Risk Analysis",
    messages: [
      "Assessing risk tolerance...",
      "Evaluating volatility factors...",
      "Analyzing correlation patterns...",
    ],
    progressRange: [50, 75],
  },
  {
    name: "Recommendation Generation",
    messages: [
      "Formulating investment strategies...",
      "Generating allocation recommendations...",
      "Creating personalized insights...",
    ],
    progressRange: [75, 100],
  },
];

interface InvestmentPlanLoadingProps {
  /**
   * Whether the component is in a card
   * @default true
   */
  inCard?: boolean;
}

export default function InvestmentPlanLoading({ inCard = true }: InvestmentPlanLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);

  // Simulate progress and phase changes
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        
        // Check if we need to change phases
        if (newProgress >= INVESTMENT_PLAN_PHASES[currentPhase].progressRange[1] && currentPhase < INVESTMENT_PLAN_PHASES.length - 1) {
          setCurrentPhase(prevPhase => prevPhase + 1);
        }
        
        // Reset if we reach 100%
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentPhase]);

  // Update feedback messages based on the current phase
  useEffect(() => {
    const currentPhaseData = INVESTMENT_PLAN_PHASES[currentPhase];
    setFeedbackMessages(currentPhaseData.messages);
  }, [currentPhase]);

  const spinnerContent = (
    <SpinnerWithProgress
      message={`Generating Investment Plan: ${INVESTMENT_PLAN_PHASES[currentPhase].name}`}
      feedbackMessages={feedbackMessages}
      progress={progress}
      progressLabel={`${progress}% complete`}
      size={28}
    />
  );

  if (inCard) {
    return (
      <Card>
        <CardContent className="p-6">
          {spinnerContent}
        </CardContent>
      </Card>
    );
  }

  return spinnerContent;
} 