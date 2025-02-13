import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

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

  return null;
};

export const MapSelector = ({ position, onPositionChange }) => {
  const [mode, setMode] = useState('point');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polylinePoints, setPolylinePoints] = useState([]);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Floating Icon Buttons */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ccc',
      }}>
        <button
          onClick={() => setMode('point')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '5%',
            border: 'none',
            background: mode === 'point' ? '#F04642' : '#F7FEBE',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </button>

        <button
          onClick={() => setMode('draw')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '5%',
            border: 'none',
            background: mode === 'draw' ? '#F04642' : '#F7FEBE',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
      </div>

      {/* Map Container */}
      <MapContainer
        center={position || [56.9496, 24.1052]}
        zoom={6}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapClickHandler
          mode={mode}
          setSelectedPoint={setSelectedPoint}
          setPolygonPoints={setPolygonPoints}
          setPolylinePoints={setPolylinePoints}
          onPositionChange={onPositionChange}
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
