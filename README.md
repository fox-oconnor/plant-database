# My Plant Database

A small, searchable, data-driven React app for browsing houseplants and
keeping your own collection. Built with Vite + React.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Use real plant data (free)

The app browses the [Perenual plant API](https://perenual.com/docs/api)
— 10,000+ species with photos. Without a key it runs in demo mode on
bundled sample data.

1. Sign up at https://perenual.com/ (free)
2. Open your API dashboard and copy your key
3. Copy `.env.example` to `.env` and paste the key in
4. Restart the dev server

```bash
cp .env.example .env
# edit .env, then:
npm run dev
```

## Project tour

```
src/
  main.jsx                  # entry point, mounts <App />
  App.jsx                   # state machine: tabs, search, filters,
                            # loading/error/success states, collection
  index.css                 # all styling
  api/
    perenual.js             # API calls + normalization into one shape
  data/
    samplePlants.js         # demo data (same shape as API results)
  hooks/
    useDebounce.js          # don't hammer the API on every keystroke
    useLocalStorage.js      # collection persists across refreshes
  utils/
    format.js               # sunlight labels etc.
  components/
    PlantCard.jsx           # reusable card (browse grid + collection)
    PlantDetail.jsx         # modal; fetches full details from the API
    FilterBar.jsx           # search box + filter dropdowns
    PlantForm.jsx           # add your own plant to the collection
```

## How it maps to the FE102 rubric

- **Real data from an API** — `api/perenual.js` fetches the species list
  and per-plant details; everything is normalized so components never
  care where data came from.
- **Clean grid of reusable cards** — `PlantCard` renders every plant in
  both Browse and My Collection.
- **Search + filters** — `FilterBar` (debounced text search hits the API;
  indoor/watering/light filters apply instantly, client-side, no reload).
- **Instant UI updates** — filters derive from state via `useMemo`;
  typing updates the grid as soon as the debounced query resolves.
- **All four states** — loading skeletons, "no plants found" empty state,
  error box with retry button, and the normal success grid.

## Ideas to build next

- Pagination or infinite scroll through API results
- Sort options (A–Z, thirstiest first)
- Watering reminders: per-plant "water every N days" + overdue highlighting
- Care-guide tab in the detail modal (`species-care-guide-list` endpoint)
- Export the collection as JSON
- Dark mode toggle
- Deploy it (Vercel/Netlify) — remember the API key becomes a build env var

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
