import { useState, useEffect, useMemo } from 'react'
import PlantCard from './components/PlantCard.jsx'
import PlantDetail from './components/PlantDetail.jsx'
import PlantForm from './components/PlantForm.jsx'
import FilterBar from './components/FilterBar.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useDebounce } from './hooks/useDebounce.js'
import { hasApiKey, searchSpecies } from './api/perenual.js'
import { samplePlants } from './data/samplePlants.js'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faLeaf, faSeedling, faHeart} from '@fortawesome/free-solid-svg-icons'

// ---------------------------------------------------------------------------
// App state, all in one place:
// - tab: which view is showing ("browse" | "collection")
// - query/filters: what the user is looking for
// - status: the data-loading state machine —
//   "loading" | "error" | "success" (empty results are derived, not stored)
// - results: the raw plant list from the API (or demo data)
// - selected: the plant open in the detail modal (null = closed)
// - collection: the user's saved plants, persisted to localStorage
// ---------------------------------------------------------------------------

const emptyFilters = { indoor: 'any', watering: 'any', sunlight: 'any' }

function matchesFilters(plant, filters) {
  if (filters.indoor === 'indoor' && plant.indoor !== true) return false
  if (filters.indoor === 'outdoor' && plant.indoor !== false) return false
  if (filters.watering !== 'any' && plant.watering !== filters.watering) return false
  if (filters.sunlight !== 'any' && !plant.sunlight.includes(filters.sunlight)) return false
  return true
}

export default function App() {
  const [tab, setTab] = useState('browse')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [status, setStatus] = useState('loading')
  const [results, setResults] = useState([])
  const [retryKey, setRetryKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [collection, setCollection] = useLocalStorage('plant-collection', [])
  const [favorites, setFavorites] = useLocalStorage('fav-collection', [])
  const [wishlist, setWishlist] = useLocalStorage('wish-collection', [])

  const debouncedQuery = useDebounce(query, 400)

  // Fetch whenever the debounced search text changes (or on retry).
  // Without an API key we filter the bundled demo data instead —
  // the rest of the app can't tell the difference.
  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        let plants
        if (hasApiKey) {
          plants = await searchSpecies(debouncedQuery)
        } else {
          const q = debouncedQuery.trim().toLowerCase()
          plants = samplePlants.filter((p) =>
            (p.commonName + ' ' + p.scientificName).toLowerCase().includes(q)
          )
        }
        if (!cancelled) {
          setResults(plants)
          setStatus('success')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, retryKey])

  // Filters apply instantly, client-side, on top of the fetched results —
  // no reload, no extra API calls. useMemo avoids recomputing on
  // unrelated renders.
  const visible = useMemo(
    () => results.filter((p) => matchesFilters(p, filters)),
    [results, filters]
  )

  const isCollected = (id) => collection.some((p) => p.id === id)
  const toggleCollect = (plant) => {
    setCollection(
      isCollected(plant.id)
        ? collection.filter((p) => p.id !== plant.id)
        : [...collection, plant]
    )
  }

  const isFavorites = (id) => favorites.some((p) => p.id === id)
  const toggleFavorites = (plant) => {
    setFavorites(
      isFavorites(plant.id)
      ? favorites.filter((p) => p.id !== plant.id)
      : [...favorites, plant]
    )
  }

  const isWish = (id) => wishlist.some((p) => p.id === id)
  const toggleWishlist = (plant) => {
    setWishlist(
      isWish(plant.id)
      ? wishlist.filter((p) => p.id !== plant.id)
      : [...wishlist, plant]
    )
  }

  const clearFilters = () => {
    setQuery('')
    setFilters(emptyFilters)
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>My Plant Database</h1>
          <p className="subtitle">
            {hasApiKey
              ? 'Browsing 10,000+ real plants via the Perenual API'
              : 'Demo mode — add a free Perenual API key for real data (see README)'}
          </p>
        </div>
        <nav className="tabs">
          <button
            className={tab === 'browse' ? 'tab active' : 'tab'}
            onClick={() => setTab('browse')}
          >
            Browse
          </button>
          <button
            className={tab === 'collection' ? 'tab active' : 'tab'}
            onClick={() => setTab('collection')}
          >
            My collection ({collection.length})
          </button>
          <button
            className={tab === 'favorites' ? 'tab active' : 'tab'}
            onClick={() => setTab('favorites')}
          >
            My Favorites ({favorites.length})
          </button>
          <button
            className={tab === 'wishlist' ? 'tab active' : 'tab'}
            onClick={() => setTab('wishlist')}
          >
            Wishlist ({wishlist.length}) 
          </button>
        </nav>
      </header>

      {tab === 'browse' && (
        <>
          <FilterBar
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
          />

          {status === 'loading' && (
            <div className="grid" aria-label="Loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="state-box error">
              <h2>Something went wrong</h2>
              <p>
                We couldn't load plants just now. Check your connection
                {hasApiKey && ' and API key'}, then try again.
              </p>
              <button
                className="btn primary"
                onClick={() => setRetryKey((k) => k + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {status === 'success' && visible.length === 0 && (
            <div className="state-box">
              <h2>No plants found</h2>
              <p>Try a different search term or clear your filters.</p>
              <button className="btn primary" onClick={clearFilters}>
                Clear search & filters
              </button>
            </div>
          )}

          {status === 'success' && visible.length > 0 && (
            <main className="grid">
              {visible.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  collected={isCollected(plant.id)}
                  favorites={isFavorites(plant.id)}
                  wishlist={isWish(plant.id)}
                  onSelect={setSelected}
                  onToggleCollect={toggleCollect}
                  onToggleFavorites={toggleFavorites}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </main>
          )}
        </>
      )}

      {tab === 'collection' && (
        <>
          <div className="toolbar">
            <button className="btn primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Close' : '+ Add your own plant'}
            </button>
          </div>

          {showForm && (
            <PlantForm
              onAdd={(plant) => {
                setCollection([...collection, plant])
                setShowForm(false)
              }}
            />
          )}
          {collection.length === 0 ? (
            <div className="state-box">
              <h2>Your collection is empty</h2>
              <p>
                Tap the <FontAwesomeIcon icon={faLeaf} /> on any plant in Browse to save it here, or add
                your own with the button above.
              </p>
            </div>
          ) : (
            <main className="grid">
              {collection.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  collected={true}
                  favorites={isFavorites(plant.id)}
                  wishlist={isWish(plant.id)}
                  onSelect={setSelected}
                  onToggleCollect={toggleCollect}
                  onToggleFavorites={toggleFavorites}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </main>
          )}
      </>
      )}
      {tab === 'favorites' && (
        <>
        <div className="toolbar">
            <button className="btn primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Close' : '+ Add your own plant'}
            </button>
          </div>
          {showForm && (
            <PlantForm
              onAdd={(plant) => {
                setFavorites([...favorites, plant])
                setShowForm(false)
              }}
            />
          )}
          {favorites.length === 0 ? (
            <div className="state-box">
              <h2>Your favorites is empty</h2>
              <p>
                Tap the <FontAwesomeIcon icon={faHeart} /> on any plant in Browse to save it here, or add 
                your own with the button above.
              </p>
            </div>
          ) : (
            <main className="grid">
              {favorites.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  collected={isCollected(plant.id)}
                  favorites={true}
                  wishlist={isWish(plant.id)}
                  onSelect={setSelected}
                  onToggleCollect={toggleCollect}
                  onToggleFavorites={toggleFavorites}
                  onToggleWishlist={toggleWishlist}
                  />
                ))}
            </main>
          )}
          </>
      )}
      {tab === 'wishlist' && (
        <>
        <div className="toolbar">
          <button className="btn primary" onClick={()=> setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add your own plant'}
          </button>
        </div>
        {showForm && (
          <PlantForm
            onAdd={(plant) => {
              setWish([...wishlist, plant])
              setShowForm(false)
            }}
            />
          )}
        {wishlist.length === 0 ? (
          <div className="state-box">
            <h2>Your wishlist is empty</h2>
            <p> Tap the <FontAwesomeIcon icon={faSeedling} /> on any plant in Browse to save it here, or add 
              your own with the button above.
            </p>
          </div>
        ) : (
          <main className="grid">
            {wishlist.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                collected={isCollected(plant.id)}
                favorites={isFavorites(plant.id)}
                wishlist={true}
                onSelect={setSelected}
                onToggleCollect={toggleCollect}
                onToggleFavorites={toggleFavorites}
                onToggleWishlist={toggleWishlist}
                />
              ))}
        </main>
          )}
          </>
        )}

      {selected && (
        <PlantDetail
          plant={selected}
          collected={isCollected(selected.id)}
          favorites={isFavorites(selected.id)}
          wishlist={isWish(selected.id)}
          onClose={() => setSelected(null)}
          onToggleCollect={toggleCollect}
          onToggleFavorites={toggleFavorites}
          onToggleWishlist={toggleWishlist}
          />
      )}
    </div>
)
}
