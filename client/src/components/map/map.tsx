import './map.scss';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Pin from '../pin/pin';

export interface MapItem {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  images: { url: string }[];
}

interface MapProps {
  items: MapItem[];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ items, zoom = 7 }) => {
  const center: [number, number] = items.length > 0
    ? [items[0].latitude, items[0].longitude]
    : [52.47, -1.926];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
    </MapContainer>
  );
};

export default Map;
