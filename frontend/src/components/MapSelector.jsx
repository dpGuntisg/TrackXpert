import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MapSelector = ({ position, onPositionChange }) => {
  return (
    <MapContainer
      center={position || [56.9496, 24.1052]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; OpenStreetMap contributors'
   />


      <MapClickHandler onPositionChange={onPositionChange} />
      {position && <Marker position={position} />}
    </MapContainer>
  );
};

const MapClickHandler = ({ onPositionChange }) => {
  useMapEvents({
    click: (e) => {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};