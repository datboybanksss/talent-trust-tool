import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CalendarDays, AlertTriangle, Plus, Trash2, Bell } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AgendaItem {
  id: string;
  title: string;
  date: Date;
  source: "meeting" | "reminder";
  notes?: string | null;
  meta?: string;
  canDelete: boolean;
}

const AgentCalendar = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00" });

  const { data: meetings = [] } = useQuery({
    queryKey: ["agent-meetings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("shared_meetings")
        .select("id, title, notes, starts_at, created_by")
        .or(`created_by.eq.${user.id},attendee_user_ids.cs.{${user.id}}`);
      return data ?? [];
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["agent-reminders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("compliance_reminders")
        .select("id, title, description, due_date, category")
        .eq("user_id", user.id);
      return data ?? [];
    },
  });

  const allEvents: AgendaItem[] = useMemo(() => {
    const m: AgendaItem[] = meetings.map((row: any) => ({
      id: `m-${row.id}`,
      title: row.title,
      date: new Date(row.starts_at),
      source: "meeting",
      notes: row.notes,
      canDelete: row.created_by === user?.id,
    }));
    const r: AgendaItem[] = reminders.map((row: any) => ({
      id: `r-${row.id}`,
      title: row.title,
      date: new Date(row.due_date),
      source: "reminder",
      notes: row.description,
      meta: row.category,
      canDelete: false,
    }));
    return [...m, ...r];
  }, [meetings, reminders, user?.id]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    allEvents.forEach((e) => {
      const k = format(e.date, "yyyy-MM-dd");
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return map;
  }, [allEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calStart, calEnd]);

  const selectedEvents = selectedDate
    ? (eventsByDate.get(format(selectedDate, "yyyy-MM-dd")) ?? []).sort((a, b) => a.date.getTime() - b.date.getTime())
    : [];

  const upcoming = useMemo(() => {
    const today = new Date();
    const fortnight = addDays(today, 14);
    return allEvents
      .filter((e) => e.date >= today && e.date <= fortnight)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allEvents]);

  const createMeeting = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const starts = new Date(`${form.date}T${form.time}:00`);
      const ends = new Date(starts.getTime() + 60 * 60 * 1000);
      const { error } = await supabase.from("shared_meetings").insert({
        created_by: user.id,
        title: form.title,
        notes: form.notes || null,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        meeting_type: "general",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-meetings", user?.id] });
      toast.success("Event added to calendar");
      setDialogOpen(false);
      setForm({ title: "", notes: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00" });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not add event"),
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shared_meetings").delete().eq("id", id.replace(/^m-/, ""));
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-meetings", user?.id] });
      toast.success("Event removed");
    },
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Meetings</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reminders</div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New calendar event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createMeeting.mutate()} disabled={!form.title || createMeeting.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <h2 className="text-lg font-display font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDate.get(key) ?? [];
                  const inMonth = isSameMonth(day, currentMonth);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`relative p-1 min-h-[4rem] border border-border/30 transition-colors text-left ${!inMonth ? "opacity-30" : "hover:bg-muted/50"} ${selected ? "bg-primary/5 ring-1 ring-primary/30" : ""} ${today ? "bg-accent/5" : ""}`}
                    >
                      <span className={`text-xs font-medium block mb-0.5 px-1 ${today ? "text-primary font-bold" : "text-foreground"}`}>{format(day, "d")}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 px-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${ev.source === "meeting" ? "bg-primary" : "bg-amber-500"}`} />
                          ))}
                          {dayEvents.length > 3 && <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">{selectedDate ? format(selectedDate, "EEE, MMM d yyyy") : "Select a date"}</h3>
              {selectedEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No events scheduled.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {selectedEvents.map((ev) => (
                      <div key={ev.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${ev.source === "meeting" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
                          {ev.source === "meeting" ? <CalendarDays className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground leading-tight">{ev.title}</p>
                          {ev.meta && <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-0.5">{ev.meta}</Badge>}
                          {ev.notes && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{ev.notes}</p>}
                        </div>
                        {ev.canDelete && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteMeeting.mutate(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Upcoming (14 days)
              </h3>
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>
                  ) : upcoming.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => { setSelectedDate(ev.date); setCurrentMonth(startOfMonth(ev.date)); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.source === "meeting" ? "bg-primary" : "bg-amber-500"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">{format(ev.date, "MMM d")}</p>
                      </div>
                    </button>
                  ))}
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
