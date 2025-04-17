'use client'

import React, { useState, useEffect } from 'react';
import { SpinnerWithSteps } from "@/components/ui/spinner-with-steps";
import { Card, CardContent } from "@/components/ui/card";

export default function UserProfileLoadingWithFeedback() {
  const [activeStep, setActiveStep] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);

  // Define the steps for loading the user profile
  const steps = [
    {
      title: "Fetching User Data",
      description: "Retrieving user information and wallet address",
    },
    {
      title: "Loading Holdings",
      description: "Fetching token balances and prices",
    },
    {
      title: "Processing Portfolio",
      description: "Calculating total value and allocations",
    },
    {
      title: "Generating Investment Plan",
      description: "Analyzing market data and creating recommendations",
    },
    {
      title: "Finalizing",
      description: "Preparing your personalized dashboard",
    },
  ];

  // Simulate step progression
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  // Update feedback messages based on the active step
  useEffect(() => {
    const messages = {
      0: [
        "Connecting to blockchain...",
        "Verifying wallet address...",
        "Retrieving user profile...",
      ],
      1: [
        "Scanning token accounts...",
        "Fetching token metadata...",
        "Retrieving price information...",
      ],
      2: [
        "Calculating portfolio value...",
        "Determining asset allocations...",
        "Processing token data...",
      ],
      3: [
        "Analyzing market trends...",
        "Evaluating risk factors...",
        "Generating recommendations...",
      ],
      4: [
        "Finalizing calculations...",
        "Preparing visualizations...",
        "Almost ready...",
      ],
    };

    setFeedbackMessages(messages[activeStep as keyof typeof messages] || []);
  }, [activeStep]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <SpinnerWithSteps
            message="Loading Your Portfolio"
            feedbackMessages={feedbackMessages}
            steps={steps}
            activeStepIndex={activeStep}
            size={32}
          />
        </CardContent>
      </Card>
    </div>
  );
} 