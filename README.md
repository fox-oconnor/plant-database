# Gaia's Garden

A small, searchable, data-driven React app for browsing houseplants and
keeping your own collection. Built with Vite + React.

## Run it

```bash
npm install
python src/api/plant_api.py
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Use real plant data 

The app browses the plant_api created for this project. 

## Project tour

```
api/
  plant_api.py              # Flask backend (port 5001)
  plants.csv                # official plant database
  user_plants.csv           # community submissions
  harvest_images.py         # photo harvester (Wikimedia Commons)
  harvest_illustrations.py  # botanical illustration harvester (Wikimedia Commons)
  scraper.py                # NC Extension Gardener scraper (hardiness, care, propagation)

src/
  main.jsx                  # entry point, mounts <App />
  App.jsx                   # state machine: tabs, search, filters,
                            # loading/error/success states, collection
  index.css                 # all styling
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
- Care-guide tab in the detail modal
- Export the collection as JSON
- Dark mode toggle

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
