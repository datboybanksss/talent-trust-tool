import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Circle, 
  Lock, 
  ArrowRight,
  FileText,
  Upload,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const Journey = () => {
  return (
    <DashboardLayout 
      title="Company Formation Journey" 
      subtitle="Follow each step to complete your company registration"
    >
      {/* Progress Overview */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-soft mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Overall Progress</h2>
            <p className="text-sm text-muted-foreground">3 of 8 steps completed</p>
          </div>
          <span className="text-3xl font-display font-bold text-gold">37%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
            style={{ width: "37%" }}
          />
        </div>
      </div>

      {/* Journey Steps */}
      <div className="space-y-6">
        {journeySteps.map((step, index) => (
          <JourneyStepCard key={step.id} step={step} index={index + 1} />
        ))}
      </div>
    </DashboardLayout>
  );
};

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "locked";
  tasks?: {
    title: string;
    completed: boolean;
  }[];
  documents?: string[];
  resolution?: string;
}

interface JourneyStepCardProps {
  step: JourneyStep;
  index: number;
}

const JourneyStepCard = ({ step, index }: JourneyStepCardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border-2 p-6 transition-all duration-300",
        step.status === "completed" && "border-success/30",
        step.status === "current" && "border-gold shadow-gold",
        step.status === "upcoming" && "border-border",
        step.status === "locked" && "border-border opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Step Number / Status */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold",
            step.status === "completed" && "bg-success text-white",
            step.status === "current" && "bg-gold text-forest-dark",
            step.status === "upcoming" && "bg-secondary text-muted-foreground",
            step.status === "locked" && "bg-muted text-muted-foreground"
          )}
        >
          {step.status === "completed" ? (
            <Check className="w-6 h-6" />
          ) : step.status === "locked" ? (
            <Lock className="w-5 h-5" />
          ) : (
            index
          )}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
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
            {step.status === "current" && (
              <Button variant="gold" size="sm">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-muted-foreground mb-4">{step.description}</p>

          {/* Tasks */}
          {step.tasks && step.status !== "locked" && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Tasks to Complete</h4>
              <div className="space-y-2">
                {step.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        task.completed ? "bg-success text-white" : "border-2 border-border"
                      )}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span className={cn(
                      "text-sm",
                      task.completed ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {step.documents && step.status !== "locked" && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Required Documents</h4>
              <div className="space-y-2">
                {step.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{doc}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {step.resolution && step.status === "current" && (
            <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-xl border border-gold/30">
              <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Resolution Required</p>
                <p className="text-sm text-muted-foreground">{step.resolution}</p>
                <Button variant="outline" size="sm" className="mt-3">
                  View Resolution Template
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const journeySteps: JourneyStep[] = [
  {
    id: "1",
    title: "Profile Setup",
    description: "Complete your personal information and verify your identity for company registration.",
    status: "completed",
    tasks: [
      { title: "Complete personal details", completed: true },
      { title: "Upload ID document", completed: true },
      { title: "Verify email address", completed: true },
    ],
  },
  {
    id: "2",
    title: "Company Name Reservation",
    description: "Reserve your unique company name with CIPC (Companies and Intellectual Property Commission).",
    status: "completed",
    tasks: [
      { title: "Submit 4 name choices", completed: true },
      { title: "Pay name reservation fee", completed: true },
      { title: "Receive name approval", completed: true },
    ],
  },
  {
    id: "3",
    title: "Company Registration",
    description: "Submit your company registration documents to CIPC and complete the registration process.",
    status: "current",
    tasks: [
      { title: "Complete CoR15.1A form", completed: true },
      { title: "Upload Memorandum of Incorporation (MOI)", completed: false },
      { title: "Submit beneficial ownership declaration", completed: false },
      { title: "Pay registration fee", completed: false },
    ],
    documents: ["Memorandum of Incorporation (MOI)", "Beneficial Ownership Declaration"],
    resolution: "Initial directors must pass a resolution to adopt the MOI and appoint the initial board.",
  },
  {
    id: "4",
    title: "Director Resolutions",
    description: "Pass initial resolutions to establish company governance and operations.",
    status: "upcoming",
    tasks: [
      { title: "Resolution to adopt MOI", completed: false },
      { title: "Resolution to appoint directors", completed: false },
      { title: "Resolution to open bank account", completed: false },
    ],
  },
  {
    id: "5",
    title: "Bank Account Setup",
    description: "Open a business bank account for your newly registered company.",
    status: "locked",
    tasks: [
      { title: "Choose bank provider", completed: false },
      { title: "Submit bank account application", completed: false },
      { title: "Complete FICA requirements", completed: false },
    ],
  },
  {
    id: "6",
    title: "Tax Registration",
    description: "Register with SARS for all applicable tax types.",
    status: "locked",
    tasks: [
      { title: "Register for Income Tax", completed: false },
      { title: "Register for VAT (if applicable)", completed: false },
      { title: "Register for PAYE", completed: false },
    ],
  },
  {
    id: "7",
    title: "Trust Formation (Optional)",
    description: "Set up a trust structure to protect your assets and manage your legacy.",
    status: "locked",
    tasks: [
      { title: "Draft trust deed", completed: false },
      { title: "Register trust with Master", completed: false },
      { title: "Appoint trustees", completed: false },
    ],
  },
  {
    id: "8",
    title: "Compliance Setup",
    description: "Set up ongoing compliance monitoring and statutory requirements.",
    status: "locked",
    tasks: [
      { title: "Configure annual return reminders", completed: false },
      { title: "Set up tax filing calendar", completed: false },
      { title: "Complete beneficial ownership register", completed: false },
    ],
  },
];

export default Journey;
