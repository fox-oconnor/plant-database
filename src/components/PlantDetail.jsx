import { useState, useEffect } from 'react'
import { hasApiKey, getSpeciesDetails } from '../api/perenual.js'
import { sunlightList } from '../utils/format.js'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faLeaf, faSeedling, faHeart} from '@fortawesome/free-solid-svg-icons'

// Detail modal. If the plant came from the API, we fetch the full
// details on open (with its own loading/error states); demo and
// custom plants already carry everything they have.

export default function PlantDetail({ plant, onClose, collected, onToggleCollect, favorites, onToggleFavorites, wishlist, onToggleWishlist }) {
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (plant.source !== 'api' || !hasApiKey) {
      setDetail(plant) // demo/custom: nothing more to fetch
      setStatus('success')
      return
    }

    let cancelled = false
    setStatus('loading')
    getSpeciesDetails(plant.id)
      .then((d) => {
        if (!cancelled) {
          setDetail(d)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [plant])

  // Close on Escape, nice touch for modals
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const shown = detail || plant

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {shown.plantImg && (
          <img className="modal-image" src={shown.plantImg} alt={shown.commonName} />
        )}
        <div className="card-title">
          <h2>{shown.commonName}</h2>
          <button
            className={collected ? 'leaf active' : 'leaf'}
            title={collected ? 'Remove from my collection' : 'Add to my collection'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollect(plant)
            }}
          >
            <FontAwesomeIcon icon={faLeaf}  />
          </button>
          <button
            className={favorites ? 'fav active' : 'fav'}
            title={favorites ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e)=> {
              e.stopPropagation()
              onToggleFavorites(plant)
            }}
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button
            className={wishlist ? 'wish active' : 'wish'}
            title={wishlist ? 'Remove from my wishlist' : 'Add to my wishlist'}
            onClick={(e)=>{
              e.stopPropagation()
              onToggleWishlist(plant)
              }}
          >
            <FontAwesomeIcon icon={faSeedling} />
          </button>
        </div>  
        {shown.scientificName && <p className="species">{shown.scientificName}</p>}
        {status === 'loading' && <p className="muted">Loading details…</p>}
        {status === 'error' && (
          <p className="muted">Couldn't load full details — showing summary.</p>
        )}

        {status !== 'loading' && (
          <>
            {shown.description && <p>{shown.description}</p>}

            <dl className="facts">
              <div>
                <dt>Watering</dt>
                <dd>{shown.watering || '—'}</dd>
              </div>
              <div>
                <dt>Sunlight</dt>
                <dd>{sunlightList(shown.sunlight)}</dd>
              </div>
              <div>
                <dt>Indoor / Outdoor</dt>
                <dd>
                  {shown.indoor === null ? '—' : shown.indoor ? 'Indoor' : 'Outdoor'}
                </dd>
              </div>
              <div>
                <dt>Cycle</dt>
                <dd>{shown.cycle || '—'}</dd>
              </div>
              {shown.maintenance && (
                <div>
                  <dt>Maintenance</dt>
                  <dd>{shown.maintenance}</dd>
                </div>
              )}
              {shown.careLevel && (
                <div>
                  <dt>Care level</dt>
                  <dd>{shown.careLevel}</dd>
                </div>
              )}
              {shown.hardiness && (
                <div>
                  <dt>Hardiness</dt>
                  <dd>{shown.hardiness}</dd>
                </div>
              )}
              {shown.poisonousToPets !== null && shown.poisonousToPets !== undefined && (
                <div>
                  <dt>Toxic to pets</dt>
                  <dd>{shown.poisonousToPets ? 'Yes ⚠' : 'No'}</dd>
                </div>
              )}
              {shown.notes && (
                <div>
                  <dt>My notes</dt>
                  <dd>{shown.notes}</dd>
                </div>
              )}
            </dl>
          </>
        )}
      </div>
    </div>
  )
}
