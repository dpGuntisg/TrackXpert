import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ mode, setSelectedPoint, setPolygonPoints, setPolylinePoints, onPositionChange }) => {
  useMapEvents({
    click(e) {
      const clickedCoord = e.latlng;

      if (mode === 'point') {
        setSelectedPoint(clickedCoord);
        onPositionChange && onPositionChange([clickedCoord.lat, clickedCoord.lng]); // Save lat & lng
      } else if (mode === 'draw') {
        setPolygonPoints((prev) => [...prev, clickedCoord]);
        setPolylinePoints((prev) => [...prev, clickedCoord]);
      }
    }
  });

  return null; // This component does not render anything
};

export const MapSelector = ({ position, onPositionChange }) => {
  const [mode, setMode] = useState('point'); // 'point' or 'draw'
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polylinePoints, setPolylinePoints] = useState([]);

  return (
    <div style={{ height: '100vh' }}>
      <div>
        <button onClick={() => setMode('point')}>Select Point</button>
        <button onClick={() => setMode('draw')}>Draw</button>
      </div>

      <MapContainer
        center={position || [56.9496, 24.1052]}
        zoom={6}
        style={{ height: '90vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Handle Map Click Events */}
        <MapClickHandler
          mode={mode}
          setSelectedPoint={setSelectedPoint}
          setPolygonPoints={setPolygonPoints}
          setPolylinePoints={setPolylinePoints}
          onPositionChange={onPositionChange} // Pass the function
        />

        {/* Marker for point selection */}
        {selectedPoint && <Marker position={selectedPoint} />}

        {/* Draw Polygon if more than 2 points */}
        {polygonPoints.length > 2 && <Polygon positions={polygonPoints} />}

        {/* Draw Polyline if more than 1 point */}
        {polylinePoints.length > 1 && <Polyline positions={polylinePoints} />}
      </MapContainer>
    </div>
  );
};
