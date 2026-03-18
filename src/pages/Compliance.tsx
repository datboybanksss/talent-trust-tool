import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Calendar,
  ArrowRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const Compliance = () => {
  return (
    <DashboardLayout 
      title="My Compliance Reminders" 
      subtitle="Track and manage all statutory compliance requirements"
    >
      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <ComplianceStatCard
          icon={AlertTriangle}
          label="Overdue"
          value={1}
          variant="danger"
        />
        <ComplianceStatCard
          icon={Clock}
          label="Due This Month"
          value={3}
          variant="warning"
        />
        <ComplianceStatCard
          icon={Calendar}
          label="Upcoming"
          value={5}
          variant="info"
        />
        <ComplianceStatCard
          icon={CheckCircle}
          label="Completed"
          value={12}
          variant="success"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="default" size="sm">All Tasks</Button>
        <Button variant="ghost" size="sm">Overdue</Button>
        <Button variant="ghost" size="sm">Due Soon</Button>
        <Button variant="ghost" size="sm">Completed</Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Compliance Tasks */}
      <div className="space-y-4">
        {complianceTasks.map((task) => (
          <ComplianceTaskCard key={task.id} task={task} />
        ))}
      </div>
    </DashboardLayout>
  );
};

interface ComplianceStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: "danger" | "warning" | "info" | "success";
}

const ComplianceStatCard = ({ icon: Icon, label, value, variant }: ComplianceStatCardProps) => (
  <div className={cn(
    "p-4 rounded-xl border",
    variant === "danger" && "bg-destructive/10 border-destructive/30",
    variant === "warning" && "bg-warning/10 border-warning/30",
    variant === "info" && "bg-info/10 border-info/30",
    variant === "success" && "bg-success/10 border-success/30"
  )}>
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        variant === "danger" && "bg-destructive/20 text-destructive",
        variant === "warning" && "bg-warning/20 text-warning",
        variant === "info" && "bg-info/20 text-info",
        variant === "success" && "bg-success/20 text-success"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "overdue" | "due_soon" | "upcoming" | "completed";
  category: string;
  priority: "high" | "medium" | "low";
}

interface ComplianceTaskCardProps {
  task: ComplianceTask;
}

const ComplianceTaskCard = ({ task }: ComplianceTaskCardProps) => (
  <div className={cn(
    "bg-card rounded-xl border p-6 shadow-soft transition-all duration-200 hover:shadow-medium",
    task.status === "overdue" && "border-l-4 border-l-destructive",
    task.status === "due_soon" && "border-l-4 border-l-warning",
    task.status === "upcoming" && "border-l-4 border-l-info",
    task.status === "completed" && "border-l-4 border-l-success"
  )}>
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          task.status === "overdue" && "bg-destructive/10 text-destructive",
          task.status === "due_soon" && "bg-warning/10 text-warning",
          task.status === "upcoming" && "bg-info/10 text-info",
          task.status === "completed" && "bg-success/10 text-success"
        )}>
          {task.status === "completed" ? (
            <CheckCircle className="w-6 h-6" />
          ) : task.status === "overdue" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <FileCheck className="w-6 h-6" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              task.priority === "high" && "bg-destructive/20 text-destructive",
              task.priority === "medium" && "bg-warning/20 text-warning",
              task.priority === "low" && "bg-info/20 text-info"
            )}>
              {task.priority}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due: {task.dueDate}
            </span>
            <span className="text-muted-foreground">
              Category: {task.category}
            </span>
          </div>
        </div>
      </div>

      {task.status !== "completed" && (
        <Button variant={task.status === "overdue" ? "destructive" : "gold"} size="sm">
          Take Action
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

const complianceTasks: ComplianceTask[] = [
  {
    id: "1",
    title: "Annual Return Submission",
    description: "Submit annual return to CIPC within 30 days of anniversary date",
    dueDate: "Feb 15, 2026",
    status: "overdue",
    category: "CIPC",
    priority: "high",
  },
  {
    id: "2",
    title: "Provisional Tax Payment",
    description: "Submit second provisional tax payment to SARS",
    dueDate: "Feb 28, 2026",
    status: "due_soon",
    category: "SARS",
    priority: "high",
  },
  {
    id: "3",
    title: "VAT Return",
    description: "Submit monthly VAT201 return for January 2026",
    dueDate: "Feb 25, 2026",
    status: "due_soon",
    category: "SARS",
    priority: "medium",
  },
  {
    id: "4",
    title: "Beneficial Ownership Declaration Update",
    description: "Update BO declaration if any changes to beneficial owners",
    dueDate: "Mar 1, 2026",
    status: "due_soon",
    category: "CIPC",
    priority: "medium",
  },
  {
    id: "5",
    title: "PAYE Monthly Return",
    description: "Submit EMP201 for February payroll",
    dueDate: "Mar 7, 2026",
    status: "upcoming",
    category: "SARS",
    priority: "medium",
  },
  {
    id: "6",
    title: "Company Name Reservation Renewed",
    description: "Reserved company name for registration",
    dueDate: "Jan 10, 2026",
    status: "completed",
    category: "CIPC",
    priority: "low",
  },
];

export default Compliance;
