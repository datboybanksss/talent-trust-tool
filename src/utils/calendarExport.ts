import { format } from "date-fns";

export interface CalendarEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  allDay?: boolean;
}

// Format date for iCal (YYYYMMDDTHHMMSSZ)
const formatICSDate = (date: Date, allDay?: boolean): string => {
  if (allDay) return format(date, "yyyyMMdd");
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
};

// Format date for URL params (YYYYMMDDTHHMMSS)
const formatURLDate = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// Encode text for URLs
const enc = (text: string) => encodeURIComponent(text);

/**
 * Generate a Google Calendar "Add" URL
 */
export const getGoogleCalendarUrl = (event: CalendarEventData): string => {
  const start = formatURLDate(event.startDate);
  const end = formatURLDate(event.endDate || new Date(event.startDate.getTime() + 3600000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    ...(event.description && { details: event.description }),
    ...(event.location && { location: event.location }),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate an Outlook.com "Add" URL
 */
export const getOutlookCalendarUrl = (event: CalendarEventData): string => {
  const start = event.startDate.toISOString();
  const end = (event.endDate || new Date(event.startDate.getTime() + 3600000)).toISOString();
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: start,
    enddt: end,
    ...(event.description && { body: event.description }),
    ...(event.location && { location: event.location }),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
};

/**
 * Generate a Yahoo Calendar "Add" URL
 */
export const getYahooCalendarUrl = (event: CalendarEventData): string => {
  const start = formatURLDate(event.startDate);
  const duration = event.endDate
    ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / 60000)
    : 60;
  const hours = String(Math.floor(duration / 60)).padStart(2, "0");
  const mins = String(duration % 60).padStart(2, "0");

  const params = new URLSearchParams({
    v: "60",
    title: event.title,
    st: start,
    dur: `${hours}${mins}`,
    ...(event.description && { desc: event.description }),
    ...(event.location && { in_loc: event.location }),
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Generate a single .ics event string
 */
const generateICSEvent = (event: CalendarEventData): string => {
  const start = formatICSDate(event.startDate, event.allDay);
  const end = formatICSDate(
    event.endDate || new Date(event.startDate.getTime() + 3600000),
    event.allDay
  );
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@legacybuilder`;
  const now = formatICSDate(new Date());

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    event.allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    event.allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${event.title}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`);
  if (event.location) lines.push(`LOCATION:${event.location}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
};

/**
 * Generate a full .ics calendar file content from multiple events
 */
export const generateICSFile = (events: CalendarEventData[], calendarName = "LegacyBuilder Events"): string => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LegacyBuilder//Agent Calendar//EN",
    `X-WR-CALNAME:${calendarName}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.map(generateICSEvent),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
};

/**
 * Generate a single-event .ics and return as data URI (for Apple Calendar)
 */
export const generateSingleICS = (event: CalendarEventData): string => {
  return generateICSFile([event], event.title);
};

/**
 * Download an .ics file
 */
export const downloadICSFile = (events: CalendarEventData[], filename = "legacybuilder-events.ics") => {
  const content = generateICSFile(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download a single event as .ics (Apple Calendar)
 */
export const downloadSingleICS = (event: CalendarEventData) => {
  const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  downloadICSFile([event], filename);
};
