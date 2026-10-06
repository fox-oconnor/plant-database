import { sunlightList } from '../utils/format.js'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faLeaf, faSeedling, faHeart} from '@fortawesome/free-solid-svg-icons'
// One plant card — the reusable UI piece rendered in a grid.
// Click the card for details; the heart button toggles favorites.
// The leaf button toggles collections.
// The parent owns all data and passes callbacks down as props.

export default function PlantCard({ plant, collected, onSelect, onToggleCollect, favorites, onToggleFavorites, wishlist, onToggleWishlist }) {
  const cardImg = plant.illustrationImg || plant.plantImg
  return (
    <article className="card plant-card" onClick={() => onSelect(plant)}>
      <div className="card-image">
        {cardImg ? (
          <img src={cardImg} alt={plant.commonName} loading="lazy" />
        ) : (
          <div className="image-placeholder">No photo</div>
        )}
        <button
          className={collected ? 'heart active' : 'heart'}
          title={collected ? 'Remove from my collection' : 'Add to my collection'}
          onClick={(e) => {
            e.stopPropagation() // don't open the detail modal
            onToggleCollect(plant)
          }}
        >
          <FontAwesomeIcon icon={faLeaf} className="collected"/>
        </button>
      </div>

      <div className="card-body">
        <div className="card-title">
          <h2>{plant.commonName}</h2>
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
            onClick={(e)=> {
              e.stopPropagation()
              onToggleWishlist(plant)
            }}
          >
            <FontAwesomeIcon icon={faSeedling} />
          </button>
        </div>
        {plant.scientificName && <p className="species">{plant.scientificName}</p>}

        <div className="badges">
          {plant.watering && (
            <span className="badge">Water: {plant.watering.toLowerCase()}</span>
          )}
          {plant.indoor !== null && (
            <span className="badge">{plant.indoor ? 'Indoor' : 'Outdoor'}</span>
          )}
        </div>
        <p className="sunlight">{sunlightList(plant.sunlight)}</p>
      </div>
    </article>
  )
}
