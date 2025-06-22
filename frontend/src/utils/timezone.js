import { format, toZonedTime } from "date-fns-tz";

export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney"
];

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function formatSlot(slot, tz) {
  try {
    const zoned = toZonedTime(slot, tz);
    return format(zoned, "yyyy-MM-dd HH:mm (zzz)", { timeZone: tz });
  } catch {
    return slot;
  }
}