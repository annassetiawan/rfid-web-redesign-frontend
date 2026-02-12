"use client";

import { Check } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type StepStatus = "completed" | "active" | "upcoming" | "error";

export type StepperItem = {
  id: string;
  label: string;
  helper?: string;
  status: StepStatus;
};

type StepperProps = {
  steps: StepperItem[];
  progressValue: number;
};

export function FormStepper({ steps, progressValue }: StepperProps) {
  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-[720px] items-start justify-between gap-4 md:min-w-0">
          {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";
            const isError = step.status === "error";
            const isUpcoming = step.status === "upcoming";

            return (
              <div key={step.id} className="flex flex-1 items-start gap-3">
                <div className="relative flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isCompleted && "border-indigo-600 bg-indigo-600 text-white",
                      isActive && "border-indigo-600 bg-white text-indigo-600",
                      isUpcoming && "border-slate-200 bg-white text-slate-400",
                      isError && "border-rose-500 bg-white text-rose-500"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="ml-3 mr-1 hidden h-px flex-1 bg-slate-200 md:block" />
                  )}
                </div>

                <div className="min-w-[120px]">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive && "text-slate-900",
                      isCompleted && "text-slate-700",
                      isUpcoming && "text-slate-500",
                      isError && "text-rose-600"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.helper && <p className="text-xs text-slate-400">{step.helper}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Progress value={progressValue} className="h-1.5" />
    </div>
  );
}
