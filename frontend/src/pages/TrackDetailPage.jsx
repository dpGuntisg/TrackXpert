import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPencil, faTrash, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { MapSelector, startIcon, endIcon} from '../components/MapSelector';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { TrackForm } from '../components/TrackForm.jsx';

// Constants
const API_BASE_URL = "http://localhost:5000/api";

// Extract modals into separate components
const DeleteConfirmationModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-mainBlue rounded-xl p-6 max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Delete Track</h3>
      <p className="text-gray-300 mb-6">
        Are you sure you want to permanently delete this track? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="bg-mainYellow hover:bg-yellow-200 text-mainBlue rounded-lg font-medium px-4 py-2"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
);

// Map component with React.memo to prevent unnecessary re-renders
const TrackMap = React.memo(({ coordinates, polyline }) => {
  const mapCenter = useMemo(() => {
    if (coordinates) {
      return [coordinates.coordinates[1], coordinates.coordinates[0]];
    } else if (polyline?.coordinates?.[0]) {
      const [lng, lat] = polyline.coordinates[0];
      return [lat, lng];
    }
    return [56.9496, 24.1052]; // Default center
  }, [coordinates, polyline]);

  const polylinePositions = useMemo(() => {
    return polyline?.coordinates?.map(coord => [coord[1], coord[0]]) || [];
  }, [polyline]);

  return (
    <div className="z-0 h-96 w-full rounded overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {coordinates && (
          <Marker position={[coordinates.coordinates[1], coordinates.coordinates[0]]} />
        )}

        {polyline?.coordinates && polylinePositions.length > 0 && (
        <>
            <Polyline positions={polylinePositions} />
            <Marker 
            position={[polyline.coordinates[0][1], polyline.coordinates[0][0]]} 
            icon={startIcon}
            />
            <Marker 
            position={[polyline.coordinates[polyline.coordinates.length - 1][1], polyline.coordinates[polyline.coordinates.length - 1][0]]} 
            icon={endIcon}
            />
        </>
        )}
      </MapContainer>
    </div>
  );
});

export default function TrackDetailPage() {
    const { id: trackId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [track, setTrack] = useState({ 
        name: "", 
        description: "", 
        location: "", 
        images: [], 
        created_by: "", 
        distance: 0,
        availability: [],
        coordinates: null,
        polyline: null
    });
    const [editValues, setEditValues] = useState({});
    const [error, setError] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [serverError, setServerError] = useState("");
    const [userId, setUserId] = useState(null);
    const [step, setStep] = useState(1);
    const [availability, setAvailability] = useState([]);
    const [drawings, setDrawings] = useState({
        point: null,
        polyline: null,
        distance: null
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Format distance with memoization
    const formattedDistance = useMemo(() => {
        return `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;
    }, [track.distance]);

    // Get user ID from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    // Fetch track data
    const getTrack = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/tracks/${trackId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            const trackData = response.data.track;
            setTrack(trackData);
            
            // Initialize edit values
            setEditValues({
                name: trackData.name,
                description: trackData.description,
                location: trackData.location,
                images: trackData.images
            });
            
            setAvailability(trackData.availability || []);
            
            // Initialize drawings
            const initialDrawings = {
                point: null,
                polyline: null,
                distance: trackData.distance || 0,
            };
            
            if (trackData.coordinates?.coordinates) {
                initialDrawings.point = [
                    trackData.coordinates.coordinates[1], 
                    trackData.coordinates.coordinates[0]
                ];
            }
            
            if (trackData.polyline?.coordinates) {
                initialDrawings.polyline = trackData.polyline.coordinates.map(
                    coord => [coord[1], coord[0]]
                );
            }
            
            setDrawings(initialDrawings);
        } catch (error) {
            setServerError(error.response?.data?.message || "Error fetching the track.");
        } finally {
            setLoading(false);
        }
    }, [trackId]);

    // Load track data on component mount
    useEffect(() => {
        getTrack();
    }, [getTrack]);

    // Validate each step of the form
    const validateStep = useCallback(() => {
        switch(step) {
            case 1:
                if (!editValues.name?.trim() || editValues.name.length < 5) {
                    setError("Track name must be at least 5 characters long.");
                    return false;
                }
                if (!editValues.description?.trim() || editValues.description.length < 10) {
                    setError("Track description must be at least 10 characters long.");
                    return false;
                }
                if (!editValues.location?.trim() || editValues.location.length < 5) {
                    setError("Track location must be at least 5 characters long.");
                    return false;
                }
                if (!editValues.images || editValues.images.length === 0) {
                    setError("At least one track image is required.");
                    return false;
                }
                return true;
            
            case 2:
                return true;
                
            default:
                return true;
        }
    }, [step, editValues]);

    // Handle navigation between steps
    const handleStepNavigation = useCallback((direction) => {
        if (direction === 'next') {
            if (!validateStep()) return;
            setStep(prev => Math.min(prev + 1, 3));
        } else {
            setStep(prev => Math.max(prev - 1, 1));
        }
        setError("");
    }, [validateStep]);

    
    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === track.images.length - 1 ? 0 : prevIndex + 1
        );
    };
    
    const goToPreviousImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? track.images.length - 1 : prevIndex - 1
        );
    };
    
    useEffect(() => {
        if (track.images && currentImageIndex >= track.images.length) {
          setCurrentImageIndex(Math.max(0, track.images.length - 1));
        }
      }, [track.images, currentImageIndex]);

    // Handle image change
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditValues(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file); 
        }
    }, []);

    // Update track
    const handleEdit = useCallback(async () => {
        setError("");
    
        try {
            const updateData = {
                ...editValues,
                availability,
                coordinates: null,
                polyline: null
            };
    
            if (drawings.point) {
                updateData.latitude = drawings.point[0];
                updateData.longitude = drawings.point[1];
            }
    
            if (drawings.polyline && drawings.polyline.length >= 2) {
                updateData.polyline = {
                    type: "LineString",
                    coordinates: drawings.polyline.map(([lat, lng]) => [lng, lat])
                };
                updateData.distance = drawings.distance;
            }
    
            // Check if at least one geometry exists
            const hasGeometry = drawings.point || (drawings.polyline && drawings.polyline.length >= 2);
            if (!hasGeometry) {
                setError("At least one geometry (point or polyline) is required.");
                return;
            }
    
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/tracks/${trackId}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setEditMode(false);
            setStep(1);
            getTrack();
        } catch (error) {
            setError(error.response?.data?.message || "Error updating track");
        }
    }, [editValues, availability, drawings, trackId, getTrack]);

    // Delete track
    const handleDelete = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/tracks/${trackId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/tracks");
        } catch (error) {
            console.error("Error deleting track:", error);
            setError(error.response?.data?.message || "Error deleting the track.");
        }
    }, [trackId, navigate]);

    // Reset edit state
    const resetEditState = useCallback(() => {
        setEditValues({
            name: track.name,
            description: track.description,
            location: track.location,
            image: track.image
        });
        setAvailability(track.availability || []);
        setStep(1);
        setError("");
        setEditMode(false);
    }, [track]);

    // Handle drawings change
    const handleDrawingsChange = useCallback((newDrawings) => {
        setDrawings(newDrawings);
    }, []);

    // Edit modal content based on current step
    const renderEditStep = useCallback(() => {
        switch(step) {
            case 1:
                return (
                    <TrackForm 
                        values={editValues} 
                        setValues={setEditValues}
                        handleImageChange={handleImageChange}
                        currentImageIndex={currentImageIndex}
                        setCurrentImageIndex={setCurrentImageIndex}
                    />
                );
            case 2:
                return (
                    <AvailabilityForm
                        availability={availability}
                        setAvailability={setAvailability}
                        error={error}
                        setError={setError}
                    />
                );
            case 3:
                const centerPosition = drawings.polyline && drawings.polyline.length > 0
                ? drawings.polyline[drawings.polyline.length - 1]  
                : drawings.point || [56.9496, 24.1052]; 
                return (
                    <div className="h-96 w-full rounded-lg overflow-hidden">
                        <MapSelector 
                            position={drawings.point}
                            initialDrawings={drawings}
                            onDrawingsChange={handleDrawingsChange}
                            center={centerPosition} 
                            zoom={20}
                        />
                    </div>
                );
            default:
                return null;
        }
    }, [step, editValues, drawings, availability, error, handleImageChange, handleDrawingsChange, currentImageIndex]);

    // Render loading state
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading track details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {serverError && (
                <p className="text-red-400 text-center mb-8 text-lg">{serverError}</p>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative group">
                <div className="relative h-96 rounded overflow-hidden shadow-xl">
                    <img 
                        src={track.images[currentImageIndex].data} 
                        alt={track.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                    
                        {/* Navigation Buttons */}
                        {track.images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPreviousImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                    {"<"}
                                </button>
                                <button
                                    onClick={goToNextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                    {">"}
                                </button>
                            </>
                        )}
                </div>
                
                <div className="absolute bottom-6 left-6 space-y-2">
                    <h1 className="text-4xl font-bold drop-shadow-lg">{track.name}</h1>
                    <div className="flex flex-row items-center space-x-2 text-gray-300">
                        <FontAwesomeIcon icon={faLocationDot} />
                        <span className="font-medium">{track.location}</span>
                    </div>
                    {track.distance > 0 && (
                        <span className="text-gray-300 text-xs font-semibold px-3 py-1 opacity-80 rounded">
                            Length: {formattedDistance}
                        </span>
                    )}
                </div>
            </div>

                {/* Owner Actions */}
                {userId === track.created_by?._id && (
                    <div className="flex space-x-4 justify-end">
                        <button
                            onClick={() => setEditMode(true)}
                            className="font-semibold px-6 py-2 rounded-lg hover:text-mainRed transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            Edit Track
                        </button>
                        <button
                            onClick={() => setDeleteConfirmation(true)}
                            className="font-semibold hover:text-mainRed px-6 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete Track
                        </button>
                    </div>
                )}

                {/* Availability Section */}
                {track.availability && track.availability.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                        {track.availability.map((slot, index) => (
                            <div key={index}>
                                {slot.startDay === slot.endDay 
                                    ? `${slot.startDay}: ${slot.open_time}-${slot.close_time}`
                                    : `${slot.startDay}-${slot.endDay}: ${slot.open_time}-${slot.close_time}`}
                            </div>
                        ))}
                    </div>
                )}

                {/* Description Section */}
                <div className="p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2">
                        Track Details
                    </h2>
                    <p className="text-gray-300 leading-relaxed">{track.description}</p>
                </div>
            
                {/* Map display (only when not in edit mode) */}
                {(track.coordinates || track.polyline) && !editMode && (
                    <TrackMap 
                        coordinates={track.coordinates} 
                        polyline={track.polyline} 
                    />
                )}

                {/* Edit Modal */}
                {editMode && (
                    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold mb-4">Edit Track ({step}/3)</h3>
                                <button 
                                    type="button" 
                                    onClick={resetEditState} 
                                    className="text-gray-300 hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                </button>
                            </div>

                            {error && <p className="text-red-500 font-semibold text-lg mb-4">{error}</p>}

                            {/* Step Content */}
                            {renderEditStep()}

                            {/* Navigation Controls */}
                            <div className="flex justify-between space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => handleStepNavigation('prev')}
                                    disabled={step === 1}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                        step === 1 
                                            ? 'bg-gray-700 cursor-not-allowed' 
                                            : 'bg-gray-600 hover:bg-gray-700'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Back
                                </button>
                                <div className="flex-grow"></div>
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => handleStepNavigation('next')}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={resetEditState}
                                    className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmation && (
                    <DeleteConfirmationModal 
                        onCancel={() => setDeleteConfirmation(false)}
                        onConfirm={handleDelete}
                    />
                )}
            </div>
        </div>
    );
}