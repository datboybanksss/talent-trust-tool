import { useState } from "react";
import { Bell, CheckCircle2, Clock, FileText, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  action: string;
  client: string;
  time: string;
  icon: React.ElementType;
}

interface AgentNotificationsProps {
  pendingCount: number;
  recentActivity: ActivityItem[];
}

const AgentNotifications = ({ pendingCount, recentActivity }: AgentNotificationsProps) => {
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const notifications = [
    ...(pendingCount > 0
      ? [
          {
            id: -1,
            icon: Clock,
            title: `${pendingCount} client${pendingCount !== 1 ? "s" : ""} awaiting activation`,
            subtitle: "Send reminders or copy their activation links",
            time: "Now",
            type: "pending" as const,
          },
        ]
      : []),
    ...recentActivity.map((a, i) => ({
      id: i,
      icon: a.icon,
      title: a.action,
      subtitle: a.client,
      time: a.time,
      type: "activity" as const,
    })),
  ];

  const visibleNotifications = notifications.filter(
    (n) => !dismissedIds.has(n.id)
  );

  const totalCount = visibleNotifications.length;

  const dismiss = (id: number) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const clearAll = () => {
    setDismissedIds(new Set(notifications.map((n) => n.id)));
  };

  const iconColor = (type: string) => {
    switch (type) {
      case "pending":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {totalCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-auto py-1 px-2"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-72">
          {visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconColor(n.type)}`}
                  >
                    <n.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {n.subtitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {n.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AgentNotifications;
