import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Handshake,
  Clock,
  AlertTriangle,
  CalendarDays,
  Trophy,
  Music,
  Download,
  ExternalLink,
  CalendarPlus,
} from "lucide-react";
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
  downloadSingleICS,
  downloadICSFile,
  type CalendarEventData,
} from "@/utils/calendarExport";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "contract_expiry" | "endorsement_expiry" | "activation_pending" | "reminder" | "deadline";
  client: string;
  clientType: "athlete" | "artist";
  meta?: string;
}

// Mock events for demonstration
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1", title: "Nike Endorsement Expiry", date: new Date(2026, 2, 28),
    type: "endorsement_expiry", client: "Siya Kolisi", clientType: "athlete", meta: "R2M/yr",
  },
  {
    id: "2", title: "Team Contract Renewal", date: new Date(2026, 3, 5),
    type: "contract_expiry", client: "Kagiso Rabada", clientType: "athlete", meta: "Proteas",
  },
  {
    id: "3", title: "Recording Deal Deadline", date: new Date(2026, 2, 25),
    type: "deadline", client: "Tyla Seethal", clientType: "artist", meta: "Epic Records",
  },
  {
    id: "4", title: "Profile Activation Pending", date: new Date(2026, 2, 20),
    type: "activation_pending", client: "Eben Etzebeth", clientType: "athlete",
  },
  {
    id: "5", title: "SAMRO Filing Due", date: new Date(2026, 2, 31),
    type: "reminder", client: "Zozibini Tunzi", clientType: "artist", meta: "Royalties Q1",
  },
  {
    id: "6", title: "Adidas Sponsorship Renewal", date: new Date(2026, 3, 15),
    type: "endorsement_expiry", client: "Siya Kolisi", clientType: "athlete", meta: "R1.5M",
  },
  {
    id: "7", title: "Album Release Deadline", date: new Date(2026, 3, 10),
    type: "deadline", client: "Tyla Seethal", clientType: "artist", meta: "Debut LP",
  },
  {
    id: "8", title: "Medical Checkup Reminder", date: new Date(2026, 2, 22),
    type: "reminder", client: "Kagiso Rabada", clientType: "athlete",
  },
];

const eventTypeConfig: Record<CalendarEvent["type"], { icon: React.ElementType; color: string; dotColor: string; label: string }> = {
  contract_expiry: { icon: FileText, color: "text-destructive bg-destructive/10", dotColor: "bg-destructive", label: "Contract Expiry" },
  endorsement_expiry: { icon: Handshake, color: "text-amber-600 bg-amber-500/10", dotColor: "bg-amber-500", label: "Endorsement Expiry" },
  activation_pending: { icon: Clock, color: "text-blue-600 bg-blue-500/10", dotColor: "bg-blue-500", label: "Pending Activation" },
  reminder: { icon: AlertTriangle, color: "text-primary bg-primary/10", dotColor: "bg-primary", label: "Reminder" },
  deadline: { icon: CalendarDays, color: "text-purple-600 bg-purple-500/10", dotColor: "bg-purple-500", label: "Deadline" },
};

const AgentCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Events grouped by date key
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    MOCK_EVENTS.forEach((event) => {
      const key = format(event.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    });
    return map;
  }, []);

  const selectedEvents = selectedDate
    ? eventsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  // Convert CalendarEvent to CalendarEventData for export
  const toExportData = (ev: CalendarEvent): CalendarEventData => ({
    title: ev.title,
    description: `Client: ${ev.client}${ev.meta ? ` | ${ev.meta}` : ""}`,
    startDate: ev.date,
    allDay: true,
  });

  // Export all events as .ics
  const handleExportAll = () => {
    const exportEvents = MOCK_EVENTS.map(toExportData);
    downloadICSFile(exportEvents, "legacybuilder-agent-calendar.ics");
  };

  // Upcoming events (next 14 days from today)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const twoWeeks = addDays(today, 14);
    return MOCK_EVENTS
      .filter((e) => e.date >= today && e.date <= twoWeeks)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Legend + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-3">
          {Object.entries(eventTypeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              {config.label}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleExportAll}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export All (.ics)
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardContent className="p-5">
              {/* Month Nav */}
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-display font-bold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Week Headers */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDate.get(key) || [];
                  const inMonth = isSameMonth(day, currentMonth);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative p-1 min-h-[4rem] border border-border/30 transition-colors text-left
                        ${!inMonth ? "opacity-30" : "hover:bg-muted/50"}
                        ${selected ? "bg-primary/5 ring-1 ring-primary/30" : ""}
                        ${today ? "bg-accent/5" : ""}
                      `}
                    >
                      <span className={`
                        text-xs font-medium block mb-0.5 px-1
                        ${today ? "text-primary font-bold" : "text-foreground"}
                      `}>
                        {format(day, "d")}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 px-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[ev.type].dotColor}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">
                {selectedDate ? format(selectedDate, "EEE, MMM d yyyy") : "Select a date"}
              </h3>
              {selectedEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No events on this date</p>
                </div>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {selectedEvents.map((ev) => {
                      const config = eventTypeConfig[ev.type];
                      return (
                        <div key={ev.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${config.color}`}>
                            <config.icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground leading-tight">{ev.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {ev.clientType === "athlete" ? (
                                <Trophy className="w-3 h-3 text-primary" />
                              ) : (
                                <Music className="w-3 h-3 text-accent-foreground" />
                              )}
                              <span className="text-[10px] text-muted-foreground">{ev.client}</span>
                              {ev.meta && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">{ev.meta}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Upcoming (14 days)
              </h3>
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>
                  ) : (
                    upcomingEvents.map((ev) => {
                      const config = eventTypeConfig[ev.type];
                      const isPast = isBefore(ev.date, new Date());
                      return (
                        <button
                          key={ev.id}
                          onClick={() => {
                            setSelectedDate(ev.date);
                            setCurrentMonth(startOfMonth(ev.date));
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor} ${isPast ? "animate-pulse" : ""}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{ev.title}</p>
                            <p className="text-[10px] text-muted-foreground">{ev.client} · {format(ev.date, "MMM d")}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentCalendar;
