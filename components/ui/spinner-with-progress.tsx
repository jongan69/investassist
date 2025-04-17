import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/utils";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SpinnerWithProgressProps {
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
  /**
   * The current progress value (0-100)
   */
  progress?: number;
  /**
   * Whether to show an indeterminate progress bar
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Optional progress label
   */
  progressLabel?: string;
}

export function SpinnerWithProgress({
  message = "Loading...",
  feedbackMessages = [],
  feedbackInterval = 3000,
  size = 24,
  className,
  card = false,
  progress,
  indeterminate = false,
  progressLabel,
}: SpinnerWithProgressProps) {
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
      
      {(progress !== undefined || indeterminate) && (
        <div className="w-full max-w-xs mt-2">
          <Progress 
            value={progress} 
            className={cn(indeterminate && "animate-progress-indeterminate")} 
          />
          {progressLabel && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {progressLabel}
            </p>
          )}
        </div>
      )}
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