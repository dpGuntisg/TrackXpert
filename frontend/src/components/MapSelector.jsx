import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPencilAlt, faRotateLeft, faTrash, faSave, faExpand, faCompress, faBezierCurve } from '@fortawesome/free-solid-svg-icons';
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

// Custom icon for polyline points
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
export const endIcon = L.divIcon({
  className: 'custom-end-icon',
  html: "<div style='font-size: 16px;'>🏁</div>",
  iconSize: [20, 20],
});

// Custom icon for control point (for bezier curves)
const controlPointIcon = L.divIcon({
  className: 'custom-control-point',
  html: "<div style='width: 10px; height: 10px; background: purple; opacity: 0.8; border-radius: 50%;'></div>",
  iconSize: [10, 10],
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
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false, 
      searchLabel: 'Search for address',
      marker: { 
        icon: new L.Icon.Default(),
        draggable: false,
      }
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

// Function to create bezier curve points
const createBezierCurve = (startPoint, endPoint, controlPoint, segments = 10) => {
  const points = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Quadratic Bezier formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const lat = Math.pow(1-t, 2) * startPoint.lat + 
                2 * (1-t) * t * controlPoint.lat + 
                Math.pow(t, 2) * endPoint.lat;
                
    const lng = Math.pow(1-t, 2) * startPoint.lng + 
                2 * (1-t) * t * controlPoint.lng + 
                Math.pow(t, 2) * endPoint.lng;
                
    points.push(L.latLng(lat, lng));
  }
  
  return points;
};

// Handles map click events, depending on mode (point, polyline, or bezier)
const MapClickHandler = ({ 
  mode, 
  setSelectedPoint,
  setPolylinePoints, 
  polylinePoints, 
  setIsClosed, 
  curveControlPoint,
  setCurveControlPoint,
  addCurveSegment,
  onPositionChange,
  setEndPoint,
  hoverPosition,
  setHasUnsavedChanges
}) => {
  const map = useMap();
  
  useEffect(() => {
    // Change cursor based on the current mode
    map.getContainer().style.cursor = mode !== 'default' ? 'crosshair' : 'auto';
  }, [mode, map]);

  // Map event to handle click actions based on the selected mode
  useMapEvents({
    click(e) {
      const clickedCoord = e.latlng;
      
      // Fixed: Add handling for 'point' mode
      if (mode === 'point') {
        setSelectedPoint(clickedCoord);
        if (onPositionChange) {
          onPositionChange([clickedCoord.lat, clickedCoord.lng]);
        }
        setHasUnsavedChanges(true); // Mark changes as unsaved
      } else if (mode === 'polyline') {
        // Regular polyline mode
        if (polylinePoints.length > 2) {
          const firstPoint = polylinePoints[0];
          const distance = clickedCoord.distanceTo(firstPoint);
          
          // Check if user clicked near the first point to close the polyline
          if (distance < 10) { // Adjust sensitivity 
            setPolylinePoints([...polylinePoints, firstPoint]); // Close the polyline
            setIsClosed(true);
            setHasUnsavedChanges(true); // Mark changes as unsaved
            return;
          }
          
          // Check if user clicked near the last point to end the track
          const lastPoint = polylinePoints[polylinePoints.length - 1];
          const distanceToLast = clickedCoord.distanceTo(lastPoint);
          
          if (distanceToLast < 10) { // Adjust sensitivity
            setEndPoint(lastPoint);
            setHasUnsavedChanges(true); // Mark changes as unsaved
            return;
          }
        }
        
        // Add the new point
        setPolylinePoints(prev => [...prev, clickedCoord]);
        setIsClosed(false); // Ensure it is open after adding a new point
        setHasUnsavedChanges(true); // Mark changes as unsaved
  
      } else if (mode === 'bezier') {
        // Bezier curve mode
        if (polylinePoints.length === 0) {
          setPolylinePoints([clickedCoord]);
          setHasUnsavedChanges(true); // Mark changes as unsaved
        } else if (!curveControlPoint) {
          setCurveControlPoint(clickedCoord);
        } else {
          const lastPoint = polylinePoints[polylinePoints.length - 1];
          addCurveSegment(lastPoint, clickedCoord, curveControlPoint);
          setCurveControlPoint(null);
          setHasUnsavedChanges(true); // Mark changes as unsaved
          
          // Check if user clicked near the last point to end the track
          if (polylinePoints.length > 2) {
            const distanceToLast = clickedCoord.distanceTo(lastPoint);
            if (distanceToLast < 10) {
              setEndPoint(lastPoint);
              setHasUnsavedChanges(true); // Mark changes as unsaved
            }
          }
        }
        
        // Check if we need to close the polyline (e.g., when the user clicks near the first point)
        if (polylinePoints.length > 2) {
          const firstPoint = polylinePoints[0];
          const distance = clickedCoord.distanceTo(firstPoint);
          if (distance < 10) {
            setPolylinePoints(prev => [...prev, firstPoint]); // Close the polyline
            setIsClosed(true);
            setHasUnsavedChanges(true); // Mark changes as unsaved
          }
        }
      }
    },
  });
  
  return null;
};
  
// Handles map hover events and updates the hover position
const MapHoverHandler = ({ 
  setHoverPosition, 
  mode, 
  polylinePoints,
  curveControlPoint,
  setIsHoveringLastPoint
}) => {  
  useMapEvents({
    mousemove(e) { 
      setHoverPosition(e.latlng);
      
      // Check if hovering over the last point
      if (polylinePoints.length > 0) {
        const lastPoint = polylinePoints[polylinePoints.length - 1];
        const distance = e.latlng.distanceTo(lastPoint);
        
        // If hovering near the last point, set isHoveringLastPoint to true
        setIsHoveringLastPoint(distance < 10);
      } else {
        setIsHoveringLastPoint(false);
      }
    },
    mouseout() { 
      setHoverPosition(null);
      setIsHoveringLastPoint(false);
    },
  });

  return null;
};

// Main component for map selection with point, polyline, and bezier curve functionalities
export const MapSelector = ({ position, onPositionChange, initialDrawings = null, onDrawingsChange, center }) => {
  const [mode, setMode] = useState('point');  // Mode can be 'point', 'polyline', or 'bezier'
  const [selectedPoint, setSelectedPoint] = useState(null);  // Selected point coordinates
  const [polylinePoints, setPolylinePoints] = useState([]);  // Points for polyline
  const [curveControlPoint, setCurveControlPoint] = useState(null); // Control point for curves
  const [hoverPosition, setHoverPosition] = useState(null);  // Position of mouse hover
  const [startPoint, setStartPoint] = useState(null); //polyline starting point
  const [endPoint, setEndPoint] = useState(null); //polyline end point
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringLastPoint, setIsHoveringLastPoint] = useState(false); // New state to track hovering over last point
  const mapContainerRef = useRef(null);

  const initializedRef = useRef(false);  // Ref to track initialization state
  const drawingsRef = useRef({ point: null, polyline: null });  // Ref to store drawings for saving

  // center map on drawings
  const mapCenter = useMemo(() => {
    // Use explicitly passed center prop first
    if (center && center.length >= 2) {
      return center;
    }
    
    // Then try position prop
    if (position && position.length >= 2) {
      return position;
    }
    
    // Then try initial drawings
    if (initialDrawings?.polyline && initialDrawings.polyline.length > 0) {
      return initialDrawings.polyline[0]; // First point of polyline
    }
    
    if (initialDrawings?.point && initialDrawings.point.length >= 2) {
      return initialDrawings.point;
    }
    
    // Default fallback
    return [56.9496, 24.1052];
  }, [center, position, initialDrawings]);
  
  // Function to add a curve segment to the polyline
  const addCurveSegment = (startPoint, endPoint, controlPoint) => {
    const curvePoints = createBezierCurve(startPoint, endPoint, controlPoint);
    
    // Add all points from the curve except the first one (which is already in the polyline)
    setPolylinePoints(prev => [...prev, ...curvePoints.slice(1)]);
    setHasUnsavedChanges(true); // Mark changes as unsaved after adding curve
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      const element = mapContainerRef.current;
      if (element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle switching to bezier mode
  const switchToBezierMode = () => {
    setMode('bezier');
    setCurveControlPoint(null);
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = (
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      
      setIsFullscreen(!!isInFullscreen);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Reset control point when changing modes
  useEffect(() => {
    setCurveControlPoint(null);
  }, [mode]);

  // Reset endpoint when clearing polyline or starting new one
  useEffect(() => {
    if (polylinePoints.length === 0) {
      setEndPoint(null);
    }
  }, [polylinePoints]);

  // Initialize map with existing drawings if available
  useEffect(() => {
    if (!initialDrawings || initializedRef.current) return;

    if (initialDrawings.point) {
      setSelectedPoint(L.latLng(initialDrawings.point[0], initialDrawings.point[1]));
    }
    
    if (initialDrawings.polyline && initialDrawings.polyline.length) {
      const polylineLatLngs = initialDrawings.polyline.map(([lat, lng]) => L.latLng(lat, lng));
      setPolylinePoints(polylineLatLngs);
      
      // If there's an endpoint in the initial drawings, set it
      if (initialDrawings.endpoint) {
        setEndPoint(L.latLng(initialDrawings.endpoint[0], initialDrawings.endpoint[1]));
      }
    }

    drawingsRef.current = { 
      point: initialDrawings.point, 
      polyline: initialDrawings.polyline,
      endpoint: initialDrawings.endpoint
    };
    
    initializedRef.current = true;
    setHasUnsavedChanges(false); // Initial state should be "saved"
  }, [initialDrawings]);

  // Update parent component when selected point changes
  useEffect(() => {
    if (selectedPoint && onPositionChange && initializedRef.current) {
      onPositionChange([selectedPoint.lat, selectedPoint.lng]);
    }
  }, [selectedPoint, onPositionChange]);

  // Prepares drawings for saving and triggers the callback
  const prepareDrawingsForSave = () => {
    console.log("Saving drawings...");
    
    const drawings = {
      point: selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : null,
      polyline: polylinePoints.length > 1 ? polylinePoints.map(p => [p.lat, p.lng]) : null,
      distance: polylinePoints.length > 1 ? calculatePolylineLength() : null,
      endpoint: endPoint ? [endPoint.lat, endPoint.lng] : null
    };
    
    drawingsRef.current = drawings;
    
    if (onDrawingsChange) {
      onDrawingsChange(drawings);
      console.log("Drawings saved:", drawings);
    }
    
    setHasUnsavedChanges(false);
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
    if ((mode === 'polyline' || mode === 'bezier') && polylinePoints.length > 0) {
      // If we have an endpoint and it's the last point, clear it
      if (endPoint && endPoint === polylinePoints[polylinePoints.length - 1]) {
        setEndPoint(null);
      }
      
      setPolylinePoints(prev => {
        const newPoints = prev.slice(0, -1);
        // If we're undoing the point that closed the track, set isClosed to false
        if (isClosed && newPoints.length > 0) {
          const firstPoint = newPoints[0];
          const lastPoint = newPoints[newPoints.length - 1];
          const distance = firstPoint.distanceTo(lastPoint);
          if (distance >= 20) {
            setIsClosed(false);
          }
        }
        if (newPoints.length === 0) {
          setStartPoint(null);
        }
        return newPoints;
      });
      setCurveControlPoint(null);
      setHasUnsavedChanges(true); // Mark changes as unsaved
    } else if (mode === 'point' && selectedPoint) {
      setSelectedPoint(null);
      if (onPositionChange) onPositionChange(null);
      setHasUnsavedChanges(true); // Mark changes as unsaved
    }
  };

  // Clear current drawing (either point or polyline)
  const handleClear = () => {
    if (mode === 'polyline' || mode === 'bezier') {
      setPolylinePoints([]);
      setStartPoint(null);
      setEndPoint(null);
      setCurveControlPoint(null);
      setIsClosed(false);
    }
    if (mode === 'point') {
      setSelectedPoint(null);
      if (onPositionChange) onPositionChange(null);
    }
    
    setHasUnsavedChanges(true); // Mark that changes need to be saved
    
    // Allow state updates to complete, then save
    setTimeout(() => {
      const drawings = {
        point: null,
        polyline: null,
        distance: null,
        endpoint: null
      };
      drawingsRef.current = drawings;
      if (onDrawingsChange) onDrawingsChange(drawings);
      setHasUnsavedChanges(false);
    }, 0);
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
  const lastPolylinePoint = polylinePoints.length > 0 ? polylinePoints[polylinePoints.length - 1] : null;

  // Apply responsive classes for fullscreen mode
  const mapContainerStyle = {
    height: isFullscreen ? '100%' : '100vh',
    width: '100%',
    position: 'relative'
  };

  // Control panel position adjustment for mobile
  const controlPanelStyle = {
    position: 'absolute',
    top: '10px',
    right:'10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  };

  // Determine if we should show the bezier preview curve
  const showBezierPreview = mode === 'bezier' && lastPolylinePoint && curveControlPoint && hoverPosition;

  // Create the bezier preview curve points
  const bezierPreviewPoints = showBezierPreview 
    ? createBezierCurve(lastPolylinePoint, hoverPosition, curveControlPoint) 
    : [];

  // Debug information
  console.log("Current state:", {
    mode,
    hasUnsavedChanges,
    selectedPoint: selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : null,
    polylinePointsCount: polylinePoints.length,
    endPoint: endPoint ? [endPoint.lat, endPoint.lng] : null
  });

  return (
    <div 
      ref={mapContainerRef} 
      style={mapContainerStyle}
      className={`map-container ${isFullscreen ? 'fullscreen-map' : ''}`}
    >
      {/* Control panel for switching modes and performing actions */}
      <div style={controlPanelStyle}>
        {/* Point, Polyline and Bezier mode buttons */}
        <button
          onClick={() => setMode('point')}
          title="Place a marker"
          className={`button mode-button ${mode === 'point' ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </button>
        
        <button
          onClick={() => setMode('polyline')}
          title="Draw a polyline"
          className={`button mode-button ${mode === 'polyline' ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        
        <button
          onClick={switchToBezierMode}
          title="Draw with Bezier Curves"
          className={`button mode-button ${mode === 'bezier' ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faBezierCurve} />
        </button>
        
        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={!((mode === 'polyline' || mode === 'bezier') && polylinePoints.length > 0) && !(mode === 'point' && selectedPoint)}
          title="Undo last action"
          className={`button undo ${(((mode === 'polyline' || mode === 'bezier') && polylinePoints.length > 0) || (mode === 'point' && selectedPoint)) ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          disabled={!((mode === 'polyline' || mode === 'bezier') && polylinePoints.length > 0) && !(mode === 'point' && selectedPoint)}
          title="Erase Current Drawing"
          className={`button clear ${(((mode === 'polyline' || mode === 'bezier') && polylinePoints.length > 0) || (mode === 'point' && selectedPoint)) ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>

        {/* Save button */}
        <button
          onClick={prepareDrawingsForSave}
          title="Save All Drawings"
          className={`button save ${hasUnsavedChanges ? 'unsaved' : ''}`}
        >
          <FontAwesomeIcon icon={faSave} />
          {hasUnsavedChanges && <span className="save-alert">!</span>}
        </button>

        {/* Fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="button fullscreen"
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
        </button>
      </div>

      <div style={{ position: 'absolute', top:'350px', left: '5px', zIndex: 1000, display: 'flex', flexDirection: 'column', pointerEvents: 'none'}}>
        {/* Display calculated length of polyline */}
        {polylinePoints.length > 1 && (
          <div className="length-display">
            Length: {polylineLength} km
          </div>
        )}
      </div>

      {/* Leaflet map container */}
      <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl />
        <MapHoverHandler 
          setHoverPosition={setHoverPosition}
          mode={mode}
          polylinePoints={polylinePoints}
          curveControlPoint={curveControlPoint}
          setIsHoveringLastPoint={setIsHoveringLastPoint}
        />
        <MapClickHandler 
          mode={mode}
          setSelectedPoint={setSelectedPoint}
          setPolylinePoints={setPolylinePoints} 
          polylinePoints={polylinePoints} 
          setIsClosed={setIsClosed}
          curveControlPoint={curveControlPoint}
          setCurveControlPoint={setCurveControlPoint}
          addCurveSegment={addCurveSegment}
          onPositionChange={onPositionChange}
          setEndPoint={setEndPoint}
          hoverPosition={hoverPosition}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />

        {/* Display selected point as marker */}
        {selectedPoint && <Marker position={selectedPoint} />}
        
        {/* Display polyline */}
        {polylinePoints.length > 1 && (
          <Polyline positions={polylinePoints} color='#ff0000' />
        )}

        {/* Display tooltip for initial drawing */}
        {((mode === 'polyline' && polylinePoints.length < 1) || 
          (mode === 'bezier' && polylinePoints.length < 1)) && 
          hoverPosition && (
            <FloatingTooltip position={hoverPosition} 
              text="Click on the map to place the first point." 
            />
        )}

        {startPoint && (mode === 'polyline' || mode === 'bezier') && (
          <>
            <Marker position={startPoint} icon={startIcon}>
              <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
                {isClosed
                  ? "Track is closed"
                  : polylinePoints.length > 2 && !endPoint
                  ? "Click here to close the track"
                  : "Start Point"}
              </Tooltip>
            </Marker>

            {polylinePoints.length > 2 && !isClosed && !endPoint && (
              <Marker
                position={startPoint}
                icon={L.divIcon({
                  className: 'start-circle-icon',
                  html: `<div style="width: 10px; height: 10px; background: rgba(0, 0, 255, 0.3); border-radius: 50%; border: 2px solid blue;"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10], 
                })}
              />
            )}
          </>
        )}

        {/* Display endpoint marker if set */}
        {endPoint && !isClosed && (
          <Marker position={endPoint} icon={endIcon}>
            <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
              End Point
            </Tooltip>
          </Marker>
        )}

        {/* Last point hover indicator for setting endpoint */}
        {(mode === 'polyline' || mode === 'bezier') && 
          polylinePoints.length > 1 && 
          !endPoint && 
          lastPolylinePoint && 
          isHoveringLastPoint && (
            <>
              <Marker 
                position={lastPolylinePoint} 
                icon={L.divIcon({
                  className: 'last-point-hover',
                  html: `<div style="width: 14px; height: 14px; background: rgba(255, 0, 0, 0.5); border-radius: 50%; border: 2px solid red;"></div>`,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                })}
              >
                <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
                  Click to set as endpoint
                </Tooltip>
              </Marker>
            </>
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
        {(mode === 'polyline' || mode === 'bezier') && polylinePoints.map((point, index) => (
          index > 0 && 
          (!endPoint || point !== endPoint) && 
          <Marker key={`polyline-${index}`} position={point} icon={squareIcon} />
        ))}
        
        {/* Display control point for bezier curve */}
        {mode === 'bezier' && curveControlPoint && (
          <Marker position={curveControlPoint} icon={controlPointIcon} />
        )}
        
        {/* Display preview curve with control point in bezier mode */}
        {showBezierPreview && (
          <Polyline 
            positions={bezierPreviewPoints} 
            color="purple" 
            weight={2} 
            opacity={0.7} 
            dashArray="5,10" 
          />
        )}
        
        {/* Display line connecting the last polyline point to the hover position in polyline mode */}
        {mode === 'polyline' && lastPolylinePoint && hoverPosition && !isHoveringLastPoint && !endPoint && (
          <Polyline positions={[lastPolylinePoint, hoverPosition]} color="red" weight={2} opacity={0.7} dashArray="5,10" />
        )}
        
        {/* Display line from last point to control point when in bezier mode */}
        {mode === 'bezier' && lastPolylinePoint && curveControlPoint && (
          <Polyline positions={[lastPolylinePoint, curveControlPoint]} color="purple" weight={1} opacity={0.4} dashArray="3,6" />
        )}
        
        {/* Display line from control point to hover position when in bezier mode */}
        {mode === 'bezier' && curveControlPoint && hoverPosition && (
          <Polyline positions={[curveControlPoint, hoverPosition]} color="purple" weight={1} opacity={0.4} dashArray="3,6" />
        )}
        
        {/* Display bezier guide for hover in bezier mode before control point is placed */}
        {mode === 'bezier' && lastPolylinePoint && !curveControlPoint && hoverPosition && (
          <>
            {/* Show a straight dashed line to hover as a guide */}
            <Polyline 
              positions={[lastPolylinePoint, hoverPosition]} 
              color="purple" 
              weight={1} 
              opacity={0.4} 
              dashArray="3,6" 
            />
            
            {/* Show a potential control point marker at hover position */}
            <Marker position={hoverPosition} icon={controlPointIcon}>
              <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.8}>
                Click to place control point
              </Tooltip>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};