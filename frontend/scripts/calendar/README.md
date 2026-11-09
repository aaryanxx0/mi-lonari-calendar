# Offline Stock Calendar

The calendar uses generated JSON at runtime. It does not call an external
calendar, Panchang, astronomy, or holiday API.

## Reference convention

- Time zone: IST (`UTC+05:30`)
- Panchang reference point: `82°30′ E, 23°11′ N`
- Lunar month system: Amanta
- Ayanamsha: Chitrapaksha/Lahiri
- Daily Panchang values: evaluated at reference sunrise
- Rise/set and Kaal values: calculated for the reference point

The reference point and IST convention follow Rashtriya Panchang. Users must
see the in-app notice that exact local timings vary by location.

## Sources

- Rashtriya Panchang, Positional Astronomy Centre, IMD
- Indian Astronomical Ephemeris, Positional Astronomy Centre, IMD
- Maharashtra Government holiday gazettes for official holiday overrides
- Astronomy Engine for offline numerical generation (MIT licence)

The source URLs are stored in each generated year's metadata.

## Generate or regenerate years

From the `frontend` directory:

```powershell
npm run calendar:generate -- --years=2025,2026,2027
```

To add a future year:

```powershell
npm run calendar:generate -- --years=2028
```

Validate generated files:

```powershell
npm run calendar:validate
```

The command writes frontend files to `src/data/calendar`. When the sibling
`backend/data` directory exists, it also writes a backend copy.

Before publishing a future year:

1. Add official Maharashtra holiday overrides to `official-holidays.js`.
2. Remove provisional status only after the official notification is issued.
3. Compare representative Tithi, Nakshatra, rise/set, and festival dates with
   that year's Rashtriya Panchang and Indian Astronomical Ephemeris.
4. Run the data audit and Expo Doctor.

## MongoDB import

The backend can serve the same generated records. From `backend`:

```powershell
npm run calendar:import
```

`MONGODB_URI` must be configured. Importing is idempotent and upserts records
by `YYYY-MM-DD`.

The frontend still bundles the JSON, so the stock Panchang remains available
without the MongoDB import. MongoDB is useful for central updates and future
administrative tooling.
