import React from 'react';
import { Link } from 'react-router-dom';
import './pin.scss';
import { Marker, Popup } from 'react-leaflet';

// Typ dla `item`
interface PinItem {
  id: string | number;
  img: string;
  title: string;
  latitude: number;
  longitude: number;
  bedroom: number;
  bathroom: number;
  price: number;
}

interface PinProps {
  item: PinItem;
}

const Pin: React.FC<PinProps> = ({ item }) => {
  return (
    <div className="pin">
      <Marker position={[item.latitude, item.longitude]}>
        <Popup>
          <div className="popupContainer">
            <img src={item.img} alt="" />
            <div className="textContainer">
              <Link to={`/${item.id}`}>{item.title}</Link>
              <span>{item.bedroom} bedroom</span>
              <span>{item.bathroom} bathroom</span>
              <b>$ {item.price}</b>
            </div>
          </div>
        </Popup>
      </Marker>
    </div>
  );
};

export default Pin;
