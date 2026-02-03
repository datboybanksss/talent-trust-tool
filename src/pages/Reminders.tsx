import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Calendar, 
  Clock,
  Plus,
  Check,
  X,
  AlertTriangle,
  Info,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const Reminders = () => {
  return (
    <DashboardLayout 
      title="Reminders" 
      subtitle="Manage your compliance deadlines and important dates"
    >
      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm">All</Button>
          <Button variant="ghost" size="sm">Urgent</Button>
          <Button variant="ghost" size="sm">Upcoming</Button>
          <Button variant="ghost" size="sm">Completed</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
            Preferences
          </Button>
          <Button variant="gold" size="sm">
            <Plus className="w-4 h-4" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Calendar Overview */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">February 2026</h3>
          <CalendarGrid />
        </div>

        {/* Today's Reminders */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today</h3>
          <div className="space-y-3">
            {todayReminders.map((reminder, index) => (
              <TodayReminderCard key={index} reminder={reminder} />
            ))}
          </div>
        </div>
      </div>

      {/* All Reminders */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">All Reminders</h3>
        </div>
        <div className="divide-y divide-border">
          {allReminders.map((reminder) => (
            <ReminderRow key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

const CalendarGrid = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDate = 3;
  
  // February 2026 starts on Sunday
  const daysInMonth = 28;
  const startDay = 0;
  
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const hasReminder = (day: number | null) => {
    if (!day) return null;
    if (day === 15) return "urgent";
    if (day === 25 || day === 28) return "warning";
    if (day === 7) return "info";
    return null;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const reminderType = hasReminder(day);
          return (
            <div
              key={index}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative",
                !day && "invisible",
                day === currentDate && "bg-primary text-primary-foreground font-semibold",
                day && day !== currentDate && "hover:bg-secondary cursor-pointer",
                reminderType && "font-medium"
              )}
            >
              {day}
              {reminderType && day !== currentDate && (
                <div className={cn(
                  "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                  reminderType === "urgent" && "bg-destructive",
                  reminderType === "warning" && "bg-warning",
                  reminderType === "info" && "bg-info"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TodayReminder {
  time: string;
  title: string;
  type: "urgent" | "warning" | "info";
}

interface TodayReminderCardProps {
  reminder: TodayReminder;
}

const TodayReminderCard = ({ reminder }: TodayReminderCardProps) => (
  <div className={cn(
    "p-3 rounded-xl border-l-4",
    reminder.type === "urgent" && "bg-destructive/10 border-destructive",
    reminder.type === "warning" && "bg-warning/10 border-warning",
    reminder.type === "info" && "bg-info/10 border-info"
  )}>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <Clock className="w-3 h-3" />
      {reminder.time}
    </div>
    <p className="text-sm font-medium text-foreground">{reminder.title}</p>
  </div>
);

const todayReminders: TodayReminder[] = [
  { time: "9:00 AM", title: "Review compliance documents", type: "info" },
  { time: "2:00 PM", title: "Call with tax advisor", type: "warning" },
];

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "urgent" | "warning" | "info" | "completed";
  category: string;
  recurring: boolean;
}

interface ReminderRowProps {
  reminder: Reminder;
}

const ReminderRow = ({ reminder }: ReminderRowProps) => (
  <div className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
      reminder.type === "urgent" && "bg-destructive/20 text-destructive",
      reminder.type === "warning" && "bg-warning/20 text-warning",
      reminder.type === "info" && "bg-info/20 text-info",
      reminder.type === "completed" && "bg-success/20 text-success"
    )}>
      {reminder.type === "urgent" && <AlertTriangle className="w-5 h-5" />}
      {reminder.type === "warning" && <Bell className="w-5 h-5" />}
      {reminder.type === "info" && <Info className="w-5 h-5" />}
      {reminder.type === "completed" && <Check className="w-5 h-5" />}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className={cn(
        "font-medium text-foreground",
        reminder.type === "completed" && "line-through text-muted-foreground"
      )}>
        {reminder.title}
      </h4>
      <p className="text-sm text-muted-foreground truncate">{reminder.description}</p>
    </div>

    <div className="text-right flex-shrink-0">
      <p className="text-sm font-medium text-foreground">{reminder.date}</p>
      <p className="text-xs text-muted-foreground">{reminder.time}</p>
    </div>

    <span className="px-2 py-1 bg-secondary text-xs rounded-full text-muted-foreground">
      {reminder.category}
    </span>

    {reminder.type !== "completed" && (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-success/20 hover:text-success rounded-lg transition-colors">
          <Check className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
);

const allReminders: Reminder[] = [
  {
    id: "1",
    title: "Annual Return Submission",
    description: "Submit annual return to CIPC before deadline",
    date: "Feb 15, 2026",
    time: "5:00 PM",
    type: "urgent",
    category: "CIPC",
    recurring: true,
  },
  {
    id: "2",
    title: "VAT Return Due",
    description: "Monthly VAT201 submission for January",
    date: "Feb 25, 2026",
    time: "12:00 PM",
    type: "warning",
    category: "SARS",
    recurring: true,
  },
  {
    id: "3",
    title: "Provisional Tax Payment",
    description: "Second provisional tax payment deadline",
    date: "Feb 28, 2026",
    time: "5:00 PM",
    type: "warning",
    category: "SARS",
    recurring: false,
  },
  {
    id: "4",
    title: "Director Meeting",
    description: "Quarterly board meeting - prepare agenda",
    date: "Mar 5, 2026",
    time: "10:00 AM",
    type: "info",
    category: "Governance",
    recurring: true,
  },
  {
    id: "5",
    title: "Company Name Reserved",
    description: "Successfully reserved company name with CIPC",
    date: "Jan 10, 2026",
    time: "2:00 PM",
    type: "completed",
    category: "CIPC",
    recurring: false,
  },
];

export default Reminders;
