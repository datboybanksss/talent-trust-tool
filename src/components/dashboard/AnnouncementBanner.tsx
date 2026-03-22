import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Info, X, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
}

const priorityStyles: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  info: {
    bg: "bg-primary/5",
    border: "border-primary/20",
    icon: <Info className="w-4 h-4 text-primary shrink-0" />,
  },
  warning: {
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    icon: <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />,
  },
  critical: {
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    icon: <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />,
  },
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("system_announcements")
        .select("id, title, message, priority, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setAnnouncements(data as Announcement[]);
    };
    fetch();
  }, []);

  const visible = announcements.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map(a => {
        const style = priorityStyles[a.priority] || priorityStyles.info;
        return (
          <div key={a.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border}`}>
            <div className="mt-0.5">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set(prev).add(a.id))}
              className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
