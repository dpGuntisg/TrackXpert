import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPencilAlt, faRotateLeft, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './MapSelector.css';

// Override default icon settings for leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for polyline points (square red icon)
const squareIcon = L.divIcon({
  className: 'custom-square-icon',
  html: "<div style='width: 12px; height: 12px; background: red; opacity: 0.8;'></div>",
  iconSize: [12, 12],
});

// Custom icon for start point
export const startIcon = L.divIcon({
  className: 'custom-start-icon',
  html: "<div style='font-size: 20px; color: blue;'>🚩</div>",
  iconSize: [20, 20],
});

// Custom icon for end point
const endIcon = L.divIcon({
  className: 'custom-end-icon',
  html: "<div style='font-size: 16px;'>🏁</div>",
  iconSize: [20, 20],
});

// Search control component for the map, allows users to search by location
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
      searchLabel: 'Search for address',
      className: 'custom-search-control',
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const FloatingTooltip = ({ position, text }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    const tooltip = L.tooltip({
      permanent: true,
      direction: "right",
      offset: L.point(10, 0),
      opacity: 0.8,
    })
      .setLatLng(position)
      .setContent(text)
      .addTo(map);

    return () => {
      map.removeLayer(tooltip);
    };
  }, [position, text, map]);

  return null;
};


// Handles map click events, depending on mode (point or polyline)
const MapClickHandler = ({ mode, setSelectedPoint, setPolylinePoints, polylinePoints, setIsClosed }) => {
  const map = useMap();
  useEffect(() => {
    // Change cursor based on the current mode
    map.getContainer().style.cursor = mode !== 'default' ? 'crosshair' : 'auto';
  }, [mode, map]);

  // Map event to handle click actions based on the selected mode
  useMapEvents({
    click(e) {
      const clickedCoord = e.latlng;

      if (mode === 'polyline') {
        if (polylinePoints.length > 2) {
          const firstPoint = polylinePoints[0];
          const distance = clickedCoord.distanceTo(firstPoint);
          
          // Check if user clicked near the first point
          if (distance < 10) { // Adjust sensitivity 
            setPolylinePoints([...polylinePoints, firstPoint]); // Close the polyline
            setIsClosed(true);
            return;
          }
        }
        setPolylinePoints(prev => [...prev, clickedCoord]);
        setIsClosed(false);
      }
  
      if (mode === 'point') {
        setSelectedPoint(clickedCoord);
      }
    }
  });

};
  

// Handles map hover events and updates the hover position
const MapHoverHandler = ({ setHoverPosition }) => {
  useMapEvents({
    mousemove(e) { setHoverPosition(e.latlng); },
    mouseout() { setHoverPosition(null); },
  });

  return null;
};

// Main component for map selection with point and polyline drawing functionalities
export const MapSelector = ({ position, onPositionChange, initialDrawings = null, onDrawingsChange }) => {
  const [mode, setMode] = useState('point');  // Mode can be 'point' or 'polyline'
  const [selectedPoint, setSelectedPoint] = useState(null);  // Selected point coordinates
  const [polylinePoints, setPolylinePoints] = useState([]);  // Points for polyline
  const [hoverPosition, setHoverPosition] = useState(null);  // Position of mouse hover
  const [startPoint, setStartPoint] = useState(null); //polyline starting point
  const [endPoint, setEndPoint] = useState(null); //polyline end point
  const [isClosed, setIsClosed] = useState(false);


  const initializedRef = useRef(false);  // Ref to track initialization state
  const drawingsRef = useRef({ point: null, polyline: null });  // Ref to store drawings for saving

  // Default map center if no position is provided
  const mapCenter = position && position.length >= 2 ? position : [56.9496, 24.1052];

  useEffect(() => {
    // Initialize map with existing drawings if available
    if (!initialDrawings || initializedRef.current) return;

    if (initialDrawings.point) setSelectedPoint(L.latLng(initialDrawings.point[0], initialDrawings.point[1]));
    if (initialDrawings.polyline) {
      const polylineLatLngs = initialDrawings.polyline.map(([lat, lng]) => L.latLng(lat, lng));
      setPolylinePoints(polylineLatLngs);
    }

    drawingsRef.current = { point: initialDrawings.point, polyline: initialDrawings.polyline };
    initializedRef.current = true;
  }, [initialDrawings]);

  // Prepares drawings for saving and triggers the callback
  const prepareDrawingsForSave = () => {
    const drawings = {
      point: selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : null,
      polyline: polylinePoints.length > 1 ? polylinePoints.map(p => [p.lat, p.lng]) : null,
    };
    drawingsRef.current = drawings;
    if (onDrawingsChange) onDrawingsChange(drawings);
    return drawings;
  };

  useEffect(() => {
    if (polylinePoints.length > 0) {
      setStartPoint(polylinePoints[0]); // First point of the polyline
    } else {
      setStartPoint(null); // Reset if polyline is cleared
    }
  }, [polylinePoints]);
  
  

  // Undo the last action, either removing the last point or polyline
  const handleUndo = () => {
    if (mode === 'polyline' && polylinePoints.length > 0) {
      setPolylinePoints(prev => {
        const newPoints = prev.slice(0, -1);
        if (newPoints.length === 0) {
          setStartPoint(null); // Clear start point if no polyline points remain
        }
        return newPoints;
      });
    } else if (mode === 'point' && selectedPoint) {
      setSelectedPoint(null);
      if (onPositionChange) onPositionChange(null);
    }
};

  // Clear current drawing (either point or polyline)
  const handleClear = () => {
    if (mode === 'polyline') setPolylinePoints([]); setStartPoint(null);
    if (mode === 'point') {
      setSelectedPoint(null);
      if (onPositionChange) onPositionChange(null);
    }
    setTimeout(() => prepareDrawingsForSave(), 0);
  };

  const calculatePolylineLength = () => {
    return polylinePoints.reduce((total, point, index) => {
      if (index > 0) {
        total += point.distanceTo(polylinePoints[index - 1]);
      }
      return total;
    }, 0) / 1000; // Convert to kilometers
  };

  // Calculate and format the length in kilometers
  const polylineLength = polylinePoints.length > 1 ? calculatePolylineLength().toFixed(2) : 0;

  // Get the last point of the polyline (for drawing new lines)
  const lastPolylinePoint = polylinePoints[polylinePoints.length - 1];

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Control panel for switching modes and performing actions */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        {/* Point and Polyline mode buttons */}
        {['point', 'polyline'].map(type => (
          <button
            key={type}
            onClick={() => setMode(type)}
            title={type === 'point' ? 'Place a marker' : 'Draw a polyline'}
            className={`button mode-button ${mode === type ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={type === 'point' ? faMapMarkerAlt : faPencilAlt} />
          </button>
        ))}
        
        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={!((mode === 'polyline' && polylinePoints.length > 0) || (mode === 'point' && selectedPoint))}
          title="Undo last action"
          className={`button undo ${((mode === 'polyline' && polylinePoints.length > 0) || (mode === 'point' && selectedPoint)) ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          disabled={!((mode === 'polyline' && polylinePoints.length > 0) || (mode === 'point' && selectedPoint))}
          title="Erase Current Drawing"
          className={`button clear ${((mode === 'polyline' && polylinePoints.length > 0) || (mode === 'point' && selectedPoint)) ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>

        {/* Save button */}
        <button
          onClick={prepareDrawingsForSave}
          title="Save All Drawings"
          className="button save"
        >
          <FontAwesomeIcon icon={faSave} />
        </button>
      </div>

      <div style={{ position: 'absolute', top: 350, left: 5, zIndex: 1000, display: 'flex', flexDirection: 'column', pointerEvents: 'none'}}>
        {/* Display calculated length of polyline */}
        {polylinePoints.length > 1 && (
            <div className="length-display">
              Length: {polylineLength} km
            </div>
        )}
      </div>


      {/* Leaflet map container */}
      <MapContainer center={mapCenter} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl />
        <MapHoverHandler setHoverPosition={setHoverPosition} />
        <MapClickHandler mode={mode}
          setSelectedPoint={setSelectedPoint}
          setPolylinePoints={setPolylinePoints} 
          polylinePoints={polylinePoints} 
          setIsClosed={setIsClosed}
        />

        {/* Display selected point as marker */}
        {selectedPoint && <Marker position={selectedPoint} />}
        
        {/* Display polyline */}
        {polylinePoints.length > 1 && (
          <Polyline positions={polylinePoints} color='#233438' >
          </Polyline>
        )}

        {/* Display tooltip for polyline drawing */}
        {mode === 'polyline' && polylinePoints.length < 1 && hoverPosition && (
          <FloatingTooltip position={hoverPosition} 
            text="Click on the map to place a point." 
          />
        )}

        

        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
              {isClosed
                ? "Track is closed"
                : polylinePoints.length > 2
                ? "Click here to close the track"
                : "Start Point"}
            </Tooltip>
          </Marker>
        )}


        {mode === 'point' && hoverPosition && (
          <>
            <Marker position={hoverPosition}>
              <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
                Click on the map to place a point.
              </Tooltip>
            </Marker>
          </>
        )}

        {/* Display polyline points as red square markers */}
        {mode === 'polyline' && polylinePoints.map((point, index) => (
          index > 0 && <Marker key={`polyline-${index}`} position={point} icon={squareIcon} />
        ))}
        
        {/* Display line connecting the last polyline point to the hover position */}
        {mode === 'polyline' && lastPolylinePoint && hoverPosition && (
          <>
            <Polyline positions={[lastPolylinePoint, hoverPosition]} color="red" weight={2} opacity={0.7} dashArray="5,10" />
          </>
        )}
      </MapContainer>
    </div>
  );
};
