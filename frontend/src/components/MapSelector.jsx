import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPencilAlt, faDrawPolygon } from '@fortawesome/free-solid-svg-icons';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const squareIcon = L.divIcon({
  className: 'custom-square-icon',
  html: "<div style='width: 12px; height: 12px; background: red; opacity: 0.8;'></div>",
  iconSize: [12, 12],
});


const MapClickHandler = ({ mode, setSelectedPoint, setPolygonPoints, setPolylinePoints, onPositionChange }) => {
  useMapEvents({
    click(e) {
      const clickedCoord = e.latlng;

      if (mode === 'point') {
        setSelectedPoint(clickedCoord);
        onPositionChange && onPositionChange([clickedCoord.lat, clickedCoord.lng]);
      } else if (mode === 'polygon') {
        setPolygonPoints((prev) => [...prev, clickedCoord]);
      } else if (mode === 'polyline') {
        setPolylinePoints((prev) => [...prev, clickedCoord]);
      }
    }
  });
  return null;
};

const MapHoverHandler = ({ setHoverPosition, mode, polygonPoints, polylinePoints }) => {
  useMapEvents({
    mousemove(e) {
      setHoverPosition(e.latlng);
    },
    mouseout() {
      setHoverPosition(null);
    }
  });
  return null;
};

export const MapSelector = ({ position, onPositionChange }) => {
  const [mode, setMode] = useState('point');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [hoverPosition, setHoverPosition] = useState(null);


  // Get the last point for drawing hover lines
  const lastPolygonPoint = polygonPoints.length > 0 ? polygonPoints[polygonPoints.length - 1] : null;
  const lastPolylinePoint = polylinePoints.length > 0 ? polylinePoints[polylinePoints.length - 1] : null;

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Add custom cursor styles */}
      
      {/* Floating Icon Buttons */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
        {['point', 'polygon', 'polyline'].map((type, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              setMode(type);
            }}
            style={{
              width: '40px', height: '40px', borderRadius: '5%', border: 'none',
              background: mode === type ? '#F04642' : '#F7FEBE', color: mode === type ? 'white' : 'black',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <FontAwesomeIcon icon={type === 'point' ? faMapMarkerAlt : type === 'polygon' ? faPencilAlt : faDrawPolygon} />
          </button>
        ))}
      </div>

      {/* Map Container */}
      <MapContainer center={position || [56.9496, 24.1052]} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

        <MapHoverHandler setHoverPosition={setHoverPosition} mode={mode} polygonPoints={polygonPoints} polylinePoints={polylinePoints} />
        <MapClickHandler mode={mode} setSelectedPoint={setSelectedPoint} setPolygonPoints={setPolygonPoints} setPolylinePoints={setPolylinePoints} onPositionChange={onPositionChange} />

        {/* Marker for point selection */}
        {selectedPoint && <Marker position={selectedPoint}/>}

        {/* Draw Polygon */}
        {polygonPoints.length > 2 && <Polygon positions={polygonPoints} />}
        {polygonPoints.map((point, index) => (
          <Marker key={`polygon-${index}`} position={point} icon={squareIcon} />
        ))}

        {/* Draw Preview Line for Polygon */}
        {mode === 'polygon' && lastPolygonPoint && hoverPosition && (
          <Polyline 
            positions={[lastPolygonPoint, hoverPosition]} 
            color="red" 
            weight={2} 
            opacity={0.7} 
            dashArray="5,10" 
          />
        )}

        {/* Close Polygon Preview (show line from last point to first point) */}
        {mode === 'polygon' && polygonPoints.length > 2 && hoverPosition && (
          <Polyline 
            positions={[hoverPosition, polygonPoints[0]]} 
            color="red" 
            weight={2} 
            opacity={0.5} 
            dashArray="5,10" 
          />
        )}

        {/* Draw Polyline */}
        {polylinePoints.length > 1 && <Polyline positions={polylinePoints} />}
        {polylinePoints.map((point, index) => (
          <Marker key={`polyline-${index}`} position={point} icon={squareIcon} />
        ))}

        {/* Draw Preview Line for Polyline */}
        {mode === 'polyline' && lastPolylinePoint && hoverPosition && (
          <Polyline 
            positions={[lastPolylinePoint, hoverPosition]} 
            color="red" 
            weight={2} 
            opacity={0.7} 
            dashArray="5,10" 
          />
        )}
      </MapContainer>
    </div>
  );
};