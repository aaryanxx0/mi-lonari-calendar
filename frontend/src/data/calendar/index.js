import calendar2025 from './stock-calendar-2025.json';
import calendar2026 from './stock-calendar-2026.json';
import calendar2027 from './stock-calendar-2027.json';
import manifest from './manifest.json';

export const STOCK_CALENDAR_MANIFEST = manifest;

export const STOCK_CALENDARS = {
  2025: calendar2025,
  2026: calendar2026,
  2027: calendar2027
};

export const STOCK_CALENDAR_YEARS = Object.keys(STOCK_CALENDARS).map(Number);
