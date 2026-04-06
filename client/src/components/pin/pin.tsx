import React from 'react';
import { Link } from 'react-router-dom';
import './pin.scss';
import { Marker, Popup } from 'react-leaflet';
import type { MapItem } from '../map/map';

interface PinProps {
  item: MapItem;
}

const Pin: React.FC<PinProps> = ({ item }) => {
  const coverImage = item.images[0]?.url ?? '';

  return (
    // item.latitude i item.longitude są już number — bezpośrednio do Marker
    <Marker position={[item.latitude, item.longitude]}>
      <Popup>
        <div className="popupContainer">
          {coverImage && <img src={coverImage} alt={item.title} />}
          <div className="textContainer">
            <Link to={`/listings/${item.id}`}>{item.title}</Link>
            <span>{item.bedrooms} bedroom{item.bedrooms !== 1 ? 's' : ''}</span>
            <span>{item.bathrooms} bathroom{item.bathrooms !== 1 ? 's' : ''}</span>
            {/* item.price jest już number — toLocaleString() bez konwersji */}
            <b>$ {item.price.toLocaleString()}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default Pin;
