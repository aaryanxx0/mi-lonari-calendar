/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const CalendarDay = require('../src/models/CalendarDay');

const dataDirectory = path.resolve(__dirname, '../data/calendar');

const loadFiles = () => fs.readdirSync(dataDirectory)
  .filter((filename) => /^stock-calendar-\d{4}\.json$/.test(filename))
  .sort();

const importFile = async (filename) => {
  const filePath = path.join(dataDirectory, filename);
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const referenceCode = payload.metadata?.reference?.code || 'RPI-NATIONAL';
  const sourceVersion = payload.metadata?.schemaVersion || 1;
  const generatedAt = payload.metadata?.generatedAt
    ? new Date(payload.metadata.generatedAt)
    : new Date();

  const operations = Object.values(payload.records || {}).map((record) => ({
    updateOne: {
      filter: { date: record.date },
      update: {
        $set: {
          date: record.date,
          year: record.year,
          month: record.month,
          day: record.day,
          referenceCode,
          data: {
            ...record,
            reference: payload.metadata.reference
          },
          sourceVersion,
          generatedAt
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) {
    console.log(`${filename}: no records`);
    return;
  }

  const result = await CalendarDay.bulkWrite(operations, { ordered: false });
  console.log(`${filename}: ${operations.length} records, ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
};

const main = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to import calendar data');
  }

  await mongoose.connect(mongoUri);
  try {
    const files = loadFiles();
    if (!files.length) {
      throw new Error(`No stock calendar files found in ${dataDirectory}`);
    }
    for (const filename of files) {
      await importFile(filename);
    }
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
