import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/utils";
import { Loader2 } from "lucide-react";

interface SpinnerWithFeedbackProps {
  /**
   * The main message to display while loading
   */
  message?: string;
  /**
   * An array of feedback messages that will be cycled through
   */
  feedbackMessages?: string[];
  /**
   * The interval in milliseconds between feedback message changes
   * @default 3000
   */
  feedbackInterval?: number;
  /**
   * The size of the spinner in pixels
   * @default 24
   */
  size?: number;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Whether to show the spinner in a card with a background
   * @default false
   */
  card?: boolean;
}

export function SpinnerWithFeedback({
  message = "Loading...",
  feedbackMessages = [],
  feedbackInterval = 3000,
  size = 24,
  className,
  card = false,
}: SpinnerWithFeedbackProps) {
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState("");

  useEffect(() => {
    if (feedbackMessages.length === 0) return;

    // Set initial feedback
    setCurrentFeedback(feedbackMessages[0]);

    // Set up interval to cycle through feedback messages
    const interval = setInterval(() => {
      setCurrentFeedbackIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % feedbackMessages.length;
        setCurrentFeedback(feedbackMessages[nextIndex]);
        return nextIndex;
      });
    }, feedbackInterval);

    return () => clearInterval(interval);
  }, [feedbackMessages, feedbackInterval]);

  const spinnerContent = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
      <div className="text-center">
        <p className="font-medium">{message}</p>
        {currentFeedback && (
          <p className="text-sm text-muted-foreground mt-1">{currentFeedback}</p>
        )}
      </div>
    </div>
  );

  if (card) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
} 