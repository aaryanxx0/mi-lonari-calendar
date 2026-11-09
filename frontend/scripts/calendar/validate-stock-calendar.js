/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { PUBLIC_HOLIDAYS } = require('./official-holidays');

const dataDirectory = path.resolve(__dirname, '../../src/data/calendar');
const timePattern = /^\d{2}:\d{2}$/;
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const fail = (message) => {
  throw new Error(message);
};

const validateYear = (year) => {
  const filename = path.join(dataDirectory, `stock-calendar-${year}.json`);
  if (!fs.existsSync(filename)) fail(`Missing ${filename}`);

  const payload = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const records = Object.values(payload.records || {});
  const expectedCount = isLeapYear(year) ? 366 : 365;

  if (records.length !== expectedCount) {
    fail(`${year}: expected ${expectedCount} records, found ${records.length}`);
  }

  records.forEach((record) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) fail(`${record.date}: invalid date`);
    if (!timePattern.test(record.astronomy?.sunrise || '')) fail(`${record.date}: missing sunrise`);
    if (!timePattern.test(record.astronomy?.sunset || '')) fail(`${record.date}: missing sunset`);
    if (record.panchang?.tithi?.number < 1 || record.panchang?.tithi?.number > 30) {
      fail(`${record.date}: invalid Tithi`);
    }
    if (record.panchang?.nakshatra?.number < 1 || record.panchang?.nakshatra?.number > 27) {
      fail(`${record.date}: invalid Nakshatra`);
    }
    ['tithi', 'nakshatra', 'yoga', 'karana'].forEach((field) => {
      if (!record.panchang?.[field]?.endsAt?.time) {
        fail(`${record.date}: missing ${field} end time`);
      }
    });
    ['rahuKaal', 'yamaganda', 'gulikaKaal', 'abhijitMuhurat'].forEach((field) => {
      const range = record.timings?.[field];
      if (!timePattern.test(range?.start || '') || !timePattern.test(range?.end || '')) {
        fail(`${record.date}: missing ${field}`);
      }
    });
  });

  (PUBLIC_HOLIDAYS[year] || []).forEach((holiday) => {
    const events = payload.records[holiday.date]?.events || [];
    const match = events.find((event) => (
      event.names?.en === holiday.names.en
      && event.sourceId === holiday.sourceId
      && event.provisional === false
    ));
    if (!match) fail(`${year}: official holiday missing: ${holiday.date} ${holiday.names.en}`);
  });

  if (year === 2027) {
    records.forEach((record) => {
      record.events
        .filter((event) => event.governmentHoliday || event.bankHoliday)
        .forEach((event) => {
          if (!event.provisional) {
            fail(`${record.date}: 2027 holiday is not provisional: ${event.names?.en}`);
          }
        });
    });
  }

  console.log(`${year}: ${records.length} daily records validated`);
};

const main = () => {
  const years = process.argv.slice(2).length
    ? process.argv.slice(2).map(Number)
    : [2025, 2026, 2027];

  years.forEach(validateYear);
  console.log('Stock calendar validation passed');
};

main();
