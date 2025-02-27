import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPencilAlt, faDrawPolygon, faRotateLeft, faTrash, faSave} from '@fortawesome/free-solid-svg-icons';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './MapSelector.css';

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

// Search component 
const SearchControl = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for address',
      className: 'custom-search-control',
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

// function to convert array coordinates to L.LatLng objects
const arrayToLatLng = (coord) => {
  if (!coord || !Array.isArray(coord) || coord.length < 2 || 
      typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
    return null;
  }
  return L.latLng(coord[0], coord[1]);
};

// function to convert array of array coordinates to array of L.LatLng objects
const arrayToLatLngArray = (coords) => {
  if (!coords || !Array.isArray(coords)) {
    return [];
  }
  return coords.map(coord => arrayToLatLng(coord)).filter(coord => coord !== null);
};

const MapClickHandler = ({ mode, setSelectedPoint, setPolygonPoints, setPolylinePoints, onPositionChange }) => {
  useMapEvents({
    click(e) {
      const clickedCoord = e.latlng;

      if (mode === 'point') {
        setSelectedPoint(clickedCoord);
        if (onPositionChange && clickedCoord) {
          onPositionChange([clickedCoord.lat, clickedCoord.lng]);
        }
      } else if (mode === 'polygon') {
        setPolygonPoints(prev => [...prev, clickedCoord]);
      } else if (mode === 'polyline') {
        setPolylinePoints(prev => [...prev, clickedCoord]);
      }
    }
  });
  return null;
};

const MapHoverHandler = ({ setHoverPosition }) => {
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

export const MapSelector = ({ position, onPositionChange, initialDrawings = null, onDrawingsChange }) => {
  const [mode, setMode] = useState('point');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [hoverPosition, setHoverPosition] = useState(null);
  
  const mapCenter = position && Array.isArray(position) && position.length >= 2 ? 
    position : [56.9496, 24.1052];

  useEffect(() => {
    if (!initialDrawings) return;
    
    try {
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        if (initialDrawings.point) {
            const [lng, lat] = initialDrawings.point;
            setSelectedPoint(L.latLng(lat, lng));
        }
        
        if (initialDrawings.polygon) {
            const polygonLatLngs = initialDrawings.polygon.map(([lng, lat]) => 
                L.latLng(lat, lng)
            );
            setPolygonPoints(polygonLatLngs);
        }
        
        if (initialDrawings.polyline) {
            const polylineLatLngs = initialDrawings.polyline.map(([lng, lat]) => 
                L.latLng(lat, lng)
            );
            setPolylinePoints(polylineLatLngs);
        }
    } catch (error) {
        console.error("Error initializing drawings:", error);
    }
    

}, [initialDrawings]);

  // Convert LatLng objects to arrays for storage
  const prepareDrawingsForSave = () => {
    // Convert Leaflet [lat, lng] to GeoJSON [lng, lat]
    const drawings = {
        point: selectedPoint ? [selectedPoint.lng, selectedPoint.lat] : null,
        polygon: polygonPoints.length > 0 ? 
            polygonPoints.map(p => [p.lng, p.lat]) : 
            null,
        polyline: polylinePoints.length > 0 ? 
            polylinePoints.map(p => [p.lng, p.lat]) : 
            null
    };

    if (onDrawingsChange) {
        onDrawingsChange(drawings);
    }
    
    if (selectedPoint && onPositionChange) {
        onPositionChange([selectedPoint.lat, selectedPoint.lng]);
    }

    return drawings;
};

  const lastPolygonPoint = polygonPoints.length > 0 ? polygonPoints[polygonPoints.length - 1] : null;
  const lastPolylinePoint = polylinePoints.length > 0 ? polylinePoints[polylinePoints.length - 1] : null;
  
  const validPolygonPoints = polygonPoints.filter(point => point && point.lat && point.lng);
  const validPolylinePoints = polylinePoints.filter(point => point && point.lat && point.lng);
  
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Mode Selector buttons */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', border: '1px solid #ccc',}}>
        {['point', 'polygon', 'polyline'].map((type) => (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              setMode(type);
            }}
            title={type === 'point' ? 'Place a marker' : type === 'polygon' ? 'Draw a polygon' : 'Draw a polyline'}
            style={{
              width: '40px', height: '40px', borderRadius: '5%', border: 'none',
              background: mode === type ? '#F04642' : '#F7FEBE', color: mode === type ? 'white' : '#233438',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <FontAwesomeIcon icon={type === 'point' ? faMapMarkerAlt : type === 'polygon' ? faDrawPolygon : faPencilAlt} />
          </button>
        ))}
        {/* Undo button */} 
        <button
          onClick={() => {
            if (mode === 'polygon' && polygonPoints.length > 0) {
              setPolygonPoints(polygonPoints.slice(0, -1));
            } else if (mode === 'polyline' && polylinePoints.length > 0) {
              setPolylinePoints(polylinePoints.slice(0, -1));
            } else if (mode === 'point' && selectedPoint) {
              setSelectedPoint(null);
            }
          }}
          disabled={!(
            (mode === 'polygon' && polygonPoints.length > 0) || 
            (mode === 'polyline' && polylinePoints.length > 0) || 
            (mode === 'point' && selectedPoint)
          )}
          title="Undo last action"
          style={{
            width: '40px', height: '40px', borderRadius: '5%', border: 'none',
            background: (mode === 'polygon' && polygonPoints.length > 0) || 
                      (mode === 'polyline' && polylinePoints.length > 0) || 
                      (mode === 'point' && selectedPoint) ? '#00FF00' : '#ccc',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (mode === 'polygon' && polygonPoints.length > 0) || 
                  (mode === 'polyline' && polylinePoints.length > 0) || 
                  (mode === 'point' && selectedPoint) ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            marginTop: '10px'
          }}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button
          onClick={() => {
            if(mode === 'polygon') {
              setPolygonPoints([]);
            } else if(mode === 'polyline') {
              setPolylinePoints([]);
            } else if (mode === 'point') {
              setSelectedPoint(null);
            }
          }}
          disabled={!(
            (mode === 'polygon' && polygonPoints.length > 0) || 
            (mode === 'polyline' && polylinePoints.length > 0) || 
            (mode === 'point' && selectedPoint)
          )}
          title="Erase Current Drawing"
          style={{
            width: '40px', height: '40px', borderRadius: '5%', border: 'none',
            background: (mode === 'polygon' && polygonPoints.length > 0) || 
                      (mode === 'polyline' && polylinePoints.length > 0) || 
                      (mode === 'point' && selectedPoint) ? '#FFA500' : '#ccc',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (mode === 'polygon' && polygonPoints.length > 0) || 
                  (mode === 'polyline' && polylinePoints.length > 0) || 
                  (mode === 'point' && selectedPoint) ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        {/* Save button */}
        <button
          onClick={prepareDrawingsForSave}
          title="Save All Drawings"
          style={{
            width: '40px', height: '40px', borderRadius: '5%', border: 'none',
            background: '#4169E1',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <FontAwesomeIcon icon={faSave} />
        </button>
      </div>

      {/* Map Container */}
      <MapContainer center={mapCenter} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        
        {/* Search Control */}
        <SearchControl position="topleft" />

        <MapHoverHandler setHoverPosition={setHoverPosition} />
        <MapClickHandler 
          mode={mode} 
          setSelectedPoint={setSelectedPoint} 
          setPolygonPoints={setPolygonPoints} 
          setPolylinePoints={setPolylinePoints} 
          onPositionChange={onPositionChange} 
        />

        {/* Marker for point selection */}
        {selectedPoint && selectedPoint.lat && selectedPoint.lng && (
          <Marker position={selectedPoint} />
        )}

        {/* Draw Polygon */}
        {validPolygonPoints.length > 2 && (
          <Polygon positions={validPolygonPoints} />
        )}
        
        {mode === 'polygon' && validPolygonPoints.map((point, index) => (
          <Marker key={`polygon-${index}`} position={point} icon={squareIcon} />
        ))}

        {/* Draw Preview Line for Polygon */}
        {mode === 'polygon' && lastPolygonPoint && lastPolygonPoint.lat && lastPolygonPoint.lng && 
         hoverPosition && hoverPosition.lat && hoverPosition.lng && (
          <Polyline positions={[lastPolygonPoint, hoverPosition]} color="red" weight={2} opacity={0.7} dashArray="5,10" />
        )}

        {/* Close Polygon Preview */}
        {mode === 'polygon' && validPolygonPoints.length > 2 && 
         validPolygonPoints[0] && validPolygonPoints[0].lat && validPolygonPoints[0].lng &&
         hoverPosition && hoverPosition.lat && hoverPosition.lng && (
          <Polyline positions={[hoverPosition, validPolygonPoints[0]]} color="red" weight={2} opacity={0.5} dashArray="5,10" />
        )}

        {/* Draw Polyline */}
        {validPolylinePoints.length > 1 && (
          <Polyline positions={validPolylinePoints} />
        )}
        
        {mode === 'polyline' && validPolylinePoints.map((point, index) => (
          <Marker key={`polyline-${index}`} position={point} icon={squareIcon} />
        ))}

        {/* Draw Preview Line for Polyline */}
        {mode === 'polyline' && lastPolylinePoint && lastPolylinePoint.lat && lastPolylinePoint.lng &&
         hoverPosition && hoverPosition.lat && hoverPosition.lng && (
          <Polyline positions={[lastPolylinePoint, hoverPosition]} color="red" weight={2} opacity={0.7} dashArray="5,10" />
        )}
      </MapContainer>
    </div>
  );
};