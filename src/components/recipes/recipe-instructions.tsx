'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InstructionStep {
  id: string;
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  imageUrl?: string;
  imageCaption?: string;
  tips?: string;
  temperature?: string;
}

interface RecipeInstructionsProps {
  instructions: InstructionStep[];
  className?: string;
}

interface TimerState {
  stepId: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export function RecipeInstructions({
  instructions,
  className = '',
}: RecipeInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [timers, setTimers] = useState<Map<string, TimerState>>(new Map());
  const [cookingMode, setCookingMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timers for steps that have timer requirements
  useEffect(() => {
    const newTimers = new Map<string, TimerState>();
    instructions.forEach((step) => {
      if (step.timerMinutes) {
        const totalSeconds = step.timerMinutes * 60;
        newTimers.set(step.id, {
          stepId: step.id,
          totalSeconds,
          remainingSeconds: totalSeconds,
          isRunning: false,
          isCompleted: false,
        });
      }
    });
    setTimers(newTimers);
  }, [instructions]);

  // Timer countdown effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const runningTimers = Array.from(timers.values()).filter(
      (timer) => timer.isRunning
    );

    if (runningTimers.length > 0) {
      intervalRef.current = setInterval(() => {
        setTimers((prevTimers) => {
          const newTimers = new Map(prevTimers);

          runningTimers.forEach((timer) => {
            const currentTimer = newTimers.get(timer.stepId);
            if (currentTimer && currentTimer.remainingSeconds > 0) {
              newTimers.set(timer.stepId, {
                ...currentTimer,
                remainingSeconds: currentTimer.remainingSeconds - 1,
                isCompleted: currentTimer.remainingSeconds === 1,
                isRunning: currentTimer.remainingSeconds > 1,
              });
            }
          });

          return newTimers;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timers]);

  // Prevent screen sleep in cooking mode
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if (cookingMode && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake lock failed:', err);
        }
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [cookingMode]);

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const startTimer = (stepId: string) => {
    setTimers((prev) => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(stepId);
      if (timer) {
        newTimers.set(stepId, { ...timer, isRunning: true });
      }
      return newTimers;
    });
  };

  const pauseTimer = (stepId: string) => {
    setTimers((prev) => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(stepId);
      if (timer) {
        newTimers.set(stepId, { ...timer, isRunning: false });
      }
      return newTimers;
    });
  };

  const resetTimer = (stepId: string) => {
    setTimers((prev) => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(stepId);
      if (timer) {
        newTimers.set(stepId, {
          ...timer,
          remainingSeconds: timer.totalSeconds,
          isRunning: false,
          isCompleted: false,
        });
      }
      return newTimers;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepTimer = ({ step }: { step: InstructionStep }) => {
    const timer = timers.get(step.id);
    if (!timer) return null;

    const progress =
      ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) *
      100;

    return (
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Timer: {step.timerMinutes} minutes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                timer.isRunning ? pauseTimer(step.id) : startTimer(step.id)
              }
              disabled={timer.isCompleted}
              className="h-8"
            >
              {timer.isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => resetTimer(step.id)}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-3 text-center">
          <div
            className={`font-mono text-2xl font-bold ${
              timer.isCompleted
                ? 'text-green-600'
                : timer.remainingSeconds <= 60
                  ? 'text-red-600'
                  : 'text-blue-600'
            }`}
          >
            {formatTime(timer.remainingSeconds)}
          </div>
          {timer.isCompleted && (
            <div className="mt-1 flex items-center justify-center gap-1 text-green-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Timer Complete!</span>
            </div>
          )}
        </div>

        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timer.isCompleted
                ? 'bg-green-500'
                : timer.remainingSeconds <= 60
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const StepCard = ({
    step,
    index,
  }: {
    step: InstructionStep;
    index: number;
  }) => {
    const isCompleted = completedSteps.has(step.id);
    const isCurrent = cookingMode && currentStep === index;

    return (
      <Card
        className={`transition-all duration-200 ${
          isCurrent ? 'shadow-lg ring-2 ring-blue-500' : ''
        } ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Step Number */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => toggleStepCompletion(step.id)}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step.stepNumber}
            </div>

            <div className="flex-1">
              {/* Step Content */}
              <div
                className={`leading-relaxed text-gray-900 ${
                  isCompleted ? 'text-gray-500 line-through' : ''
                }`}
              >
                {step.instruction}
              </div>

              {/* Temperature Badge */}
              {step.temperature && (
                <Badge
                  variant="outline"
                  className="mt-2 border-orange-200 bg-orange-50 text-orange-700"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {step.temperature}
                </Badge>
              )}

              {/* Tips */}
              {step.tips && (
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <strong>Tip:</strong> {step.tips}
                    </div>
                  </div>
                </div>
              )}

              {/* Step Image */}
              {step.imageUrl && (
                <div className="mt-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image
                      src={step.imageUrl}
                      alt={step.imageCaption || `Step ${step.stepNumber}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {step.imageCaption && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      {step.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Timer */}
              <StepTimer step={step} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Instructions</CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant={cookingMode ? 'default' : 'outline'}
              onClick={() => setCookingMode(!cookingMode)}
              className={cookingMode ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {cookingMode ? 'Exit Cooking Mode' : 'Cooking Mode'}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {completedSteps.size > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-700">
                Progress: {completedSteps.size} of {instructions.length} steps
                completed
              </span>
              <span className="text-green-600">
                {Math.round((completedSteps.size / instructions.length) * 100)}%
                complete
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-green-200">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${(completedSteps.size / instructions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Cooking Mode Navigation */}
        {cookingMode && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-600">Step</div>
              <div className="text-lg font-bold">
                {currentStep + 1} of {instructions.length}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={nextStep}
              disabled={currentStep === instructions.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {cookingMode ? (
          // Cooking Mode: Show only current step
          <div className="space-y-6">
            <StepCard step={instructions[currentStep]} index={currentStep} />
          </div>
        ) : (
          // Normal Mode: Show all steps
          <div className="space-y-6">
            {instructions.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {cookingMode
            ? 'Use navigation buttons to move between steps. Screen will stay awake while cooking.'
            : 'Click step numbers to mark as complete. Enable cooking mode for step-by-step guidance.'}
        </div>
      </CardContent>
    </Card>
  );
}
