# Baltic Dispatch 2026 🗺

Offline-first PWA travel companion for a Baltic road trip: **Tallinn → Riga → Vilnius → Gdańsk**, covering Estonia, Latvia, Lithuania and Poland.

**282 hand-curated entries** — history, nature, unusual sights, Cold War heritage, festivals, food, sleep and more — all embedded in a single HTML file that works 100% offline once loaded.

## 🔗 Open the app

👉 **[hannesrutqvist-alt.github.io/baltic-trip](https://hannesrutqvist-alt.github.io/baltic-trip)**

---

## Features

- **Map view** — clustered, colour-coded markers for all 282 entries. Tap a marker to open the entry card.
- **Explore** — full-text search + category/country/flag filters (🏊 Swimming · 🧖 Sauna · 👶 Kids · 📅 In July window). Sort by route order, distance, or rating.
- **Nearby** — entries sorted by distance from your GPS position, grouped into distance rings.
- **My Plan** — save entries to a personal list (persists offline via localStorage). Export as a Google Maps multi-waypoint route or copy GPS coordinates for Garmin import.
- **Offline** — Service Worker caches the app shell and map tiles as you browse. Works with no network after first load.
- **Installable** — add to Android/iOS home screen as a PWA.

## Tech

Single-file architecture — `app.html` contains all data, logic and styles inline. No build step, no server, no API keys.

- [Leaflet.js](https://leafletjs.com/) + OpenStreetMap for maps
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) for marker clustering
- Service Worker for offline caching
- localStorage for the plan list

## Data

`destinations.json` — the raw destination database (282 entries with coordinates, categories, descriptions, practical info and special flags). Generated and verified June 2026.

## Usage on Android

1. Open the app URL in Chrome
2. Tap **⋮ → Add to Home Screen**
3. Works offline from that point on — no connection needed
4. Each entry has an **Open in Google Maps** button → from there, share to Garmin Drive

---

*Trip: July 1–20, 2026 · Route: Tallinn ferry in → Gdynia ferry out*
