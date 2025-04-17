import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/utils";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Step {
  /**
   * The title of the step
   */
  title: string;
  /**
   * The description of the step
   */
  description?: string;
  /**
   * Whether the step is completed
   */
  completed?: boolean;
  /**
   * Whether the step is currently active
   */
  active?: boolean;
}

interface SpinnerWithStepsProps {
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
   * The steps to display
   */
  steps: Step[];
  /**
   * The current active step index
   */
  activeStepIndex?: number;
}

export function SpinnerWithSteps({
  message = "Loading...",
  feedbackMessages = [],
  feedbackInterval = 3000,
  size = 24,
  className,
  card = false,
  steps,
  activeStepIndex = 0,
}: SpinnerWithStepsProps) {
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
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={size} />
      </div>
      
      <div className="text-center">
        <p className="font-medium">{message}</p>
        {currentFeedback && (
          <p className="text-sm text-muted-foreground mt-1">{currentFeedback}</p>
        )}
      </div>
      
      <div className="w-full max-w-md">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === activeStepIndex;
            const isCompleted = step.completed || index < activeStepIndex;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md transition-colors",
                  isActive && "bg-primary/10",
                  isCompleted && "opacity-100",
                  !isActive && !isCompleted && "opacity-60"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      isActive ? "border-primary animate-pulse" : "border-muted-foreground"
                    )}>
                      {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  )}
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    isActive && "text-primary"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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