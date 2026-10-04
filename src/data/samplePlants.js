// Demo data used when no Perenual API key is configured.
// Same normalized shape the API layer produces, so components can't
// tell the difference. Photos are placeholders (picsum) — clearly
// labeled as demo data in the UI.

const demo = (
  id,
  commonName,
  scientificName,
  watering,
  sunlight,
  indoor,
  cycle,
  description
) => ({
  id: `demo-${id}`,
  commonName,
  scientificName,
  imageUrl: `https://picsum.photos/seed/plant-${id}/400/300`,
  thumbnailUrl: `https://picsum.photos/seed/plant-${id}/200/150`,
  watering,
  sunlight,
  cycle,
  indoor,
  description: description || null,
  source: 'demo',
})

export const samplePlants = [
  demo(1, 'Monstera', 'Monstera deliciosa', 'Average', ['part_shade'], true, 'Perennial',
    'Iconic split-leaf houseplant. Likes bright indirect light and a moss pole to climb.'),
  demo(2, 'Snake Plant', 'Sansevieria trifasciata', 'Minimum', ['full_sun', 'part_shade'], true, 'Perennial',
    'Nearly indestructible. Tolerates low light and long stretches without water.'),
  demo(3, 'Golden Pothos', 'Epipremnum aureum', 'Average', ['part_shade'], true, 'Perennial'),
  demo(4, 'Fiddle-Leaf Fig', 'Ficus lyrata', 'Average', ['full_sun'], true, 'Perennial',
    'Dramatic but fussy — hates being moved and wants consistent bright light.'),
  demo(5, 'Spider Plant', 'Chlorophytum comosum', 'Average', ['part_shade'], true, 'Perennial'),
  demo(6, 'Aloe Vera', 'Aloe barbadensis miller', 'Minimum', ['full_sun'], true, 'Perennial',
    'Succulent with medicinal gel. Let soil dry completely between waterings.'),
  demo(7, 'Peace Lily', 'Spathiphyllum wallisii', 'Frequent', ['part_shade'], true, 'Perennial',
    'Droops dramatically when thirsty, perks right back up after watering.'),
  demo(8, 'Rubber Plant', 'Ficus elastica', 'Average', ['part_shade'], true, 'Perennial'),
  demo(9, 'Lavender', 'Lavandula angustifolia', 'Minimum', ['full_sun'], false, 'Perennial',
    'Fragrant Mediterranean herb. Needs full sun and sharp drainage.'),
  demo(10, 'Basil', 'Ocimum basilicum', 'Frequent', ['full_sun'], false, 'Annual',
    'Fast-growing kitchen herb. Pinch flower buds to keep leaves coming.'),
  demo(11, 'Boston Fern', 'Nephrolepis exaltata', 'Frequent', ['part_shade'], true, 'Perennial'),
  demo(12, 'Jade Plant', 'Crassula ovata', 'Minimum', ['full_sun'], true, 'Perennial',
    'Classic succulent, supposedly brings good luck. Easy to propagate from leaves.'),
]
