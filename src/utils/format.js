// Small presentation helpers shared by components.

const SUNLIGHT_LABELS = {
  full_sun: 'Full sun',
  part_shade: 'Part shade',
  filtered_shade: 'Filtered shade',
  full_shade: 'Full shade',
}

export function sunlightLabel(value) {
  return SUNLIGHT_LABELS[value] || value.replace(/_/g, ' ')
}

export function sunlightList(sunlight) {
  if (!sunlight || sunlight.length === 0) return '—'
  return sunlight.map(sunlightLabel).join(', ')
}
