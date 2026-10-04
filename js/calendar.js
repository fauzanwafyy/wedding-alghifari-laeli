/**
 * "Save the Date": builds a Google Calendar event-template URL from config.
 * No OAuth needed; Google Calendar opens with everything pre-filled.
 */
import { formatTime } from "./utils.js";

const toGoogleDate = (iso) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); // 20261021T013000Z

export function buildCalendarDetails(config, siteUrl) {
  const { calendar, events, venue, wedding } = config;
  const tz = wedding.timezoneLabel || "WIB";
  const lines = [calendar.description, ""];
  for (const ev of events) {
    const end = ev.endTime ? ` – ${formatTime(ev.endTime)}` : ev.endText ? ` – ${ev.endText}` : "";
    lines.push(`${ev.title}: ${formatTime(ev.startTime)} ${tz}${end}`);
  }
  lines.push("", venue.name, venue.address, `Google Maps: ${venue.mapsUrl}`);
  if (siteUrl) lines.push("", `Undangan: ${siteUrl}`);
  return lines.join("\n");
}

export function buildGoogleCalendarUrl(config, siteUrl = "") {
  const { calendar, wedding } = config;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: calendar.title,
    dates: `${toGoogleDate(calendar.start)}/${toGoogleDate(calendar.end)}`,
    details: buildCalendarDetails(config, siteUrl),
    location: calendar.location,
    ctz: wedding.timezone || "Asia/Jakarta",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
