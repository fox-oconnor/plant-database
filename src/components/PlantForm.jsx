import { useState } from 'react'

// Form for adding YOUR OWN plant to the collection.
// Share to community database via selecting share checkbox.
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
  const [share, setShare] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.commonName.trim()) return
    if (share && !form.scientificName.trim()){
      setError('A scientific name is required to submit to the community database')
      return
    }
    setError('')
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
    if (share){
      try {
        const res = await fetch('http://localhost:5001/plants', {
          method: 'POST',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify({
            commonName: form.commonName.trim(),
            scientificName: form.scientificName.trim(),
            watering: form.watering,
            sunlight: form.sunlight,
            submittedBy: 'Juri'
          })
        })
        if (!res.ok) throw new Error('submission failed')
        const saved = await res.json()
        console.log('Queued as', saved.id)
      } catch {
        setError('Saved to your collection, but the community submission failed -- is the API running?')
        return
      }
  }

    setForm(emptyForm)
    setShare(false)
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
          Species (Scientific Name)
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

      <label className="share-row">
        <input
          type="checkbox"
          checked={share}
          onChange={(e) => setShare(e.target.checked)}
        />
        Also submit to the community database
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="btn primary" type="submit">
        Add to my collection
      </button>
    </form>
  )
}
