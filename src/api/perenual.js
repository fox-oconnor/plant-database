// Data layer for the Perenual plant API (https://perenual.com/docs/api).
// Free tier: sign up, grab a key from the API dashboard, put it in .env as
// VITE_PERENUAL_API_KEY. Without a key the app runs in demo mode on
// bundled sample data, so it always works.

const API_KEY = import.meta.env.VITE_PERENUAL_API_KEY
const BASE = 'https://perenual.com/api/v2'

export const hasApiKey = Boolean(API_KEY)

// The API and our demo data have different shapes, so everything gets
// normalized into one clean object the components can rely on.
export function normalizeSpecies(item) {
  return {
    id: String(item.id),
    commonName: item.common_name || 'Unknown plant',
    scientificName: Array.isArray(item.scientific_name)
      ? item.scientific_name[0]
      : item.scientific_name || '',
    imageUrl:
      item.default_image?.regular_url || item.default_image?.original_url || null,
    thumbnailUrl: item.default_image?.thumbnail || null,
    watering: item.watering || null, // "Frequent" | "Average" | "Minimum" | "None"
    sunlight: item.sunlight || [], // e.g. ["full_sun", "part_shade"]
    cycle: item.cycle || null,
    indoor: typeof item.indoor === 'boolean' ? item.indoor : null,
    source: 'api',
  }
}

export async function searchSpecies(query) {
  const url =
    `${BASE}/species-list?key=${API_KEY}` +
    `&q=${encodeURIComponent(query)}&page=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Perenual API returned ${res.status}`)
  const json = await res.json()
  return (json.data || []).map(normalizeSpecies)
}

export async function getSpeciesDetails(id) {
  const url = `${BASE}/species/details/${id}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Perenual API returned ${res.status}`)
  const item = await res.json()
  return {
    ...normalizeSpecies(item),
    description: item.description || null,
    maintenance: item.maintenance || null,
    careLevel: item.care_level || null,
    growthRate: item.growth_rate || null,
    droughtTolerant: item.drought_tolerant ?? null,
    poisonousToPets: item.poisonous_to_pets ?? null,
    hardiness:
      item.hardiness?.min && item.hardiness?.max
        ? `Zone ${item.hardiness.min}–${item.hardiness.max}`
        : null,
  }
}
