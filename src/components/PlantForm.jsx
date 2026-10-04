import { useState } from 'react'

// Form for adding YOUR OWN plant to the collection (not from the API).
// Produces the same normalized shape the rest of the app uses.

const emptyForm = {
  commonName: '',
  scientificName: '',
  watering: 'Average',
  sunlight: 'part_shade',
  indoor: 'indoor',
  notes: '',
}

export default function PlantForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm)

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.commonName.trim()) return
    onAdd({
      id: `custom-${Date.now()}`,
      commonName: form.commonName.trim(),
      scientificName: form.scientificName.trim(),
      imageUrl: null,
      thumbnailUrl: null,
      watering: form.watering,
      sunlight: [form.sunlight],
      cycle: null,
      indoor: form.indoor === 'indoor',
      notes: form.notes.trim() || null,
      source: 'custom',
    })
    setForm(emptyForm)
  }

  return (
    <form className="plant-form" onSubmit={handleSubmit}>
      <h2>Add your own plant</h2>

      <div className="form-row">
        <label>
          Name
          <input
            value={form.commonName}
            onChange={update('commonName')}
            placeholder="e.g. Monty"
            required
          />
        </label>
        <label>
          Species
          <input
            value={form.scientificName}
            onChange={update('scientificName')}
            placeholder="e.g. Monstera deliciosa"
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Watering
          <select value={form.watering} onChange={update('watering')}>
            <option>Frequent</option>
            <option>Average</option>
            <option>Minimum</option>
          </select>
        </label>
        <label>
          Light
          <select value={form.sunlight} onChange={update('sunlight')}>
            <option value="full_sun">Full sun</option>
            <option value="part_shade">Part shade</option>
            <option value="full_shade">Full shade</option>
          </select>
        </label>
        <label>
          Placement
          <select value={form.indoor} onChange={update('indoor')}>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </label>
      </div>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={update('notes')}
          placeholder="Where it sits, when you got it, quirks…"
          rows="2"
        />
      </label>

      <button className="btn primary" type="submit">
        Add to my collection
      </button>
    </form>
  )
}
