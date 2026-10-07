# My Plant Database

A small, searchable, data-driven React app for browsing houseplants and
keeping your own collection. Built with Vite + React.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Use real plant data 

The app browses the plant_api created for this project. 

## Project tour

```
src/
  main.jsx                  # entry point, mounts <App />
  App.jsx                   # state machine: tabs, search, filters,
                            # loading/error/success states, collection
  index.css                 # all styling
  api/
    plant_api.py            # API calls + normalization into one shape
    harvest_xxx.py          # Scrapers - one is used to collect photographs of the plants, the other, botanical plants.
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


## Plans to build next

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
