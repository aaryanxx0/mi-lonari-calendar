const CalendarDay = require('../models/CalendarDay');

const parseYear = (value) => {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : null;
};

const parseMonth = (value) => {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
};

exports.getCalendarDays = async (req, res) => {
  try {
    const year = parseYear(req.query.year);
    const month = parseMonth(req.query.month);

    if (!year || !month) {
      return res.status(400).json({ error: 'Valid year and month are required' });
    }

    const rows = await CalendarDay.find({ year, month })
      .sort({ day: 1 })
      .lean();

    res.json({
      year,
      month,
      referenceCode: rows[0]?.referenceCode || 'RPI-NATIONAL',
      days: rows.map((row) => row.data)
    });
  } catch (error) {
    console.error('Get calendar days error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar days' });
  }
};

exports.getCalendarDay = async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must use YYYY-MM-DD format' });
    }

    const row = await CalendarDay.findOne({ date }).lean();
    if (!row) {
      return res.status(404).json({ error: 'Calendar date is not available' });
    }

    res.json({
      referenceCode: row.referenceCode,
      day: row.data
    });
  } catch (error) {
    console.error('Get calendar day error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar day' });
  }
};

exports.getCalendarMetadata = async (req, res) => {
  try {
    const years = await CalendarDay.distinct('year');
    const sample = await CalendarDay.findOne().sort({ date: 1 }).lean();

    res.json({
      supportedYears: years.sort((a, b) => a - b),
      referenceCode: sample?.referenceCode || 'RPI-NATIONAL',
      reference: sample?.data?.reference || null,
      sourceVersion: sample?.sourceVersion || 1,
      externalRuntimeApis: false
    });
  } catch (error) {
    console.error('Get calendar metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar metadata' });
  }
};
