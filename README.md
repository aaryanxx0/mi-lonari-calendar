# Mi Lonari Calendar Extract

This repository is a standalone, public extract of the Mi Lonari calendar module. The calendar source files and generated datasets were copied byte-for-byte from the core app; the core app was not modified.

## Included

- `frontend/src/screens/calendar/` — calendar, calendar-event list, and event-form screens
- `frontend/src/data/calendar/` — bundled Panchang datasets for 2025–2027
- `frontend/src/utils/stockCalendar.js` — calendar data access helpers
- `frontend/scripts/calendar/` — data generator, official-holiday overrides, validator, and source notes
- `backend/data/calendar/` — backend copy of the generated datasets
- `backend/src/` — MongoDB calendar model, controller, and authenticated route integration
- `backend/scripts/import-calendar-data.js` — idempotent MongoDB importer

No user records, database exports, environment files, API keys, or credentials are included.

## Validate or regenerate data

```bash
cd frontend
npm install
npm run calendar:validate
npm run calendar:generate -- --years=2025,2026,2027
```

The generator uses `astronomy-engine`. Read `frontend/scripts/calendar/README.md` before publishing a new calendar year; generated values need comparison against the official Rashtriya Panchang, Indian Astronomical Ephemeris, and applicable Maharashtra holiday notifications.

## Frontend integration

`CalendarScreen.js` depends on the host app's `ThemeContext`, `LanguageContext`, and `AuthContext`. The two calendar-event screens additionally use the host app's common form/image components and authenticated community-record API. Those generic application modules were intentionally not copied because they are not calendar-specific.

The UI package versions used by the source app are documented in `frontend/package.json`. Integrate the files into an Expo/React Native application with equivalent providers and navigation routes.

## Backend integration

To import the stock calendar into MongoDB:

```bash
cd backend
npm install
MONGODB_URI='your-connection-string' npm run calendar:import
```

`calendarRoutes.js` is preserved exactly from the source app and expects the host application's `authenticate` and `checkProfileComplete` middleware. Mount it at `/calendar` after providing those middleware modules.

## Provenance

See `SOURCE_MANIFEST.md` for the source repository, commit, copied paths, and verification notes.

