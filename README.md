# European Trip 2026

A mobile-first, offline-friendly family travel companion for sightseeing in Paris, Amsterdam, Berlin and Prague. It contains focused city guides, confirmed attraction bookings, money and safety references, emergency information, and one airport-arrival guide for Prague.

Hotels, flights, intercity transport and itinerary planning are deliberately excluded.

## Run locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

The project uses only HTML, CSS and vanilla JavaScript. All links are relative and safe for a GitHub Pages project path.

## Structure

- `paris/`, `amsterdam/`, `berlin/`, `prague/` — city guides
- `prague/airport.html` — the sole airport guide
- `bookings/` — confirmed attraction bookings
- `money/`, `safety/`, `emergency/` — compact reference guides
- `css/style.css` — responsive design, dark mode and print styles
- `js/main.js` — navigation, theme and client-side search
- `manifest.json`, `sw.js` — installable offline support

Live opening hours and access rules can change. Attraction pages include official links for a final check.
