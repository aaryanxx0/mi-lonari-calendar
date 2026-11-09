import {
  STOCK_CALENDARS,
  STOCK_CALENDAR_MANIFEST,
  STOCK_CALENDAR_YEARS
} from '../data/calendar';

export const STOCK_CALENDAR_MIN_DATE = `${Math.min(...STOCK_CALENDAR_YEARS)}-01-01`;
export const STOCK_CALENDAR_MAX_DATE = `${Math.max(...STOCK_CALENDAR_YEARS)}-12-31`;

export const getStockCalendarDay = (dateString) => {
  const year = Number(String(dateString || '').slice(0, 4));
  return STOCK_CALENDARS[year]?.records?.[dateString] || null;
};

export const getStockCalendarMonth = (year, month) => {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const records = STOCK_CALENDARS[year]?.records || {};
  return Object.values(records).filter((record) => record.date.startsWith(prefix));
};

export const getLocalizedCalendarName = (value, language = 'en') => (
  value?.[language] || value?.en || ''
);

export const getReferenceMetadata = () => STOCK_CALENDAR_MANIFEST.reference;

export const isStockCalendarDateSupported = (dateString) => Boolean(
  getStockCalendarDay(dateString)
);
