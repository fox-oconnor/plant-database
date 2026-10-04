// Search box + filter dropdowns. Fully controlled: App owns the values,
// this just renders the inputs and reports changes upward.

export default function FilterBar({ query, onQueryChange, filters, onFiltersChange, onClear }) {
  const update = (field) => (e) =>
    onFiltersChange({ ...filters, [field]: e.target.value })

  const hasActiveFilters =
    query.trim() !== '' ||
    filters.indoor !== 'any' ||
    filters.watering !== 'any' ||
    filters.sunlight !== 'any'

  return (
    <div className="filter-bar">
      <input
        className="search"
        placeholder="Search plants… (e.g. monstera, fern, basil)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <select value={filters.indoor} onChange={update('indoor')} aria-label="Indoor or outdoor">
        <option value="any">Indoor & outdoor</option>
        <option value="indoor">Indoor</option>
        <option value="outdoor">Outdoor</option>
      </select>

      <select value={filters.watering} onChange={update('watering')} aria-label="Watering needs">
        <option value="any">Any watering</option>
        <option value="Frequent">Frequent water</option>
        <option value="Average">Average water</option>
        <option value="Minimum">Minimal water</option>
      </select>

      <select value={filters.sunlight} onChange={update('sunlight')} aria-label="Sunlight needs">
        <option value="any">Any light</option>
        <option value="full_sun">Full sun</option>
        <option value="part_shade">Part shade</option>
        <option value="full_shade">Full shade</option>
      </select>

      {hasActiveFilters && (
        <button className="btn ghost" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}
