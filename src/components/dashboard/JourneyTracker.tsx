import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "locked";
}

interface JourneyTrackerProps {
  steps: JourneyStep[];
  currentStep: number;
}

const JourneyTracker = ({ steps, currentStep }: JourneyTrackerProps) => {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border">
        <div 
          className="absolute top-0 left-0 w-full bg-primary transition-all duration-500"
          style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex gap-4">
            {/* Step Icon */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                step.status === "completed" && "bg-primary text-primary-foreground",
                step.status === "current" && "bg-gold text-forest-dark ring-4 ring-gold/30",
                step.status === "upcoming" && "bg-secondary text-muted-foreground",
                step.status === "locked" && "bg-muted text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-5 h-5" />
              ) : step.status === "locked" ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>

            {/* Step Content */}
            <div
              className={cn(
                "flex-1 p-4 rounded-xl transition-all duration-300",
                step.status === "current" 
                  ? "bg-card border-2 border-gold shadow-soft" 
                  : "bg-card border border-border",
                step.status === "locked" && "opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                {step.status === "current" && (
                  <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs font-medium rounded-full">
                    In Progress
                  </span>
                )}
                {step.status === "completed" && (
                  <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JourneyTracker;
