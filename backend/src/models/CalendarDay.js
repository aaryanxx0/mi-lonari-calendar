const mongoose = require('mongoose');

const calendarDaySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  referenceCode: {
    type: String,
    required: true,
    default: 'RPI-NATIONAL'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  sourceVersion: {
    type: Number,
    default: 1
  },
  generatedAt: Date
}, {
  timestamps: true
});

calendarDaySchema.index({ year: 1, month: 1, day: 1 });
calendarDaySchema.index({ referenceCode: 1, date: 1 });

module.exports = mongoose.model('CalendarDay', calendarDaySchema);
