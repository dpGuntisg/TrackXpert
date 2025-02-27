import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPencil, faTrash, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Polygon, Polyline } from 'react-leaflet';
import { MapSelector } from '../components/MapSelector';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { TrackForm } from '../components/TrackForm.jsx';


export default function TrackDetailPage() {
    const { id: trackId } = useParams();
    const [track, setTrack] = useState({ 
        name: "", 
        description: "", 
        location: "", 
        image: "", 
        created_by: "", 
        availability: [],
        coordinates: null
    });
    const [editValues, setEditValues] = useState({ ...track });
    const [error, setError] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [serverError, setServerError] = useState("");
    const [userId, setUserId] = useState(null);
    const token = localStorage.getItem('token');
    const [coordinates, setCoordinates] = useState(null);
    const [step, setStep] = useState(1);
    const [availability, setAvailability] = useState([]);

    let mapCenter = [56.9496, 24.1052];
    if (track.coordinates) {
        mapCenter = [track.coordinates.coordinates[1], track.coordinates.coordinates[0]];
    } else if (track.polygon?.coordinates?.[0]?.[0]) {
        // Use first polygon point's coordinates [lat, lng]
        const [lng, lat] = track.polygon.coordinates[0][0];
        mapCenter = [lat, lng];
    } else if (track.polyline?.coordinates?.[0]) {
        // Use first polyline point's coordinates [lat, lng]
        const [lng, lat] = track.polyline.coordinates[0];
        mapCenter = [lat, lng];
    }
    const [drawings, setDrawings] = useState({
        point: null,
        polygon: null,
        polyline: null
    });

    const getTrack = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/tracks/${trackId}`);
            const trackData = response.data.track;
            setTrack(trackData);
            setEditValues({
                name: trackData.name,
                description: trackData.description,
                location: trackData.location,
                image: trackData.image
            });
            setAvailability(trackData.availability || []);
            setDrawings({
                point: trackData.coordinates?.coordinates || null,
                polygon: trackData.polygon?.coordinates[0] || null,
                polyline: trackData.polyline?.coordinates || null
            });
        } catch (error) {
            setServerError(error.response?.data?.message || "Error fetching the track.");
        }
    };

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
        getTrack();
    }, [trackId]);

    const handleEdit = async () => {
        setError("");
    
        try {
            const updateData = {
                ...editValues,
                availability: availability,
                // Point coordinates (GeoJSON format [lng, lat])
                longitude: drawings.point ? drawings.point[0] : null, // lng
                latitude: drawings.point ? drawings.point[1] : null,  // lat
                // Polygon coordinates (GeoJSON format)
                polygon: drawings.polygon ? {
                    type: "Polygon",
                    coordinates: [drawings.polygon] 
                } : null,
                // Polyline coordinates (GeoJSON format)
                polyline: drawings.polyline ? {
                    type: "LineString",
                    coordinates: drawings.polyline
                } : null
            };
    
            await axios.patch(
                `http://localhost:5000/api/tracks/${trackId}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditMode(false);
            getTrack();
        } catch (error) {
            setError(error.response?.data?.message || "Error updating track");
        }
    };


    const validateStep = () => {
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
                if (!editValues.image) {
                    setError("Track image is required.");
                    return false;
                }
                return true;
            
            case 2:
                return true;
                
            default:
                return true;
        }
    };

    const handleStepNavigation = (direction) => {
        if (direction === 'next') {
            if (!validateStep()) return;
            setStep(prev => Math.min(prev + 1, 3));
        } else {
            setStep(prev => Math.max(prev - 1, 1));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditValues({ ...editValues, image: reader.result }); // Save the base64 string as the image URL
            };
            reader.readAsDataURL(file); 
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/tracks/${trackId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.href = "/tracks";
        } catch (error) {
            console.error("Error deleting track:", error);
            setError(error.response?.data?.message || "Error deleting the track.");
        }
    };

    const resetEditState = () => {
        setEditValues({ ...track });
        setAvailability(track.availability || []);
        setCoordinates(track.coordinates 
            ? [track.coordinates.coordinates[1], track.coordinates.coordinates[0]]
            : null
        );
        setStep(1);
        setError("");
        setEditMode(false);
    };




return (
    <div className="min-h-screen p-6">
        {serverError && (
            <p className="text-red-400 text-center mb-8 text-lg">{serverError}</p>
        )}

        {track.name ? (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="relative group">
                    <div className="relative h-96 rounded overflow-hidden shadow-xl">
                        <img 
                            src={track.image || 'default-image.jpg'} 
                            alt={track.name}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                    </div>
                    
                    <div className="absolute bottom-6 left-6 space-y-2">
                        <h1 className="text-4xl font-bold drop-shadow-lg">{track.name}</h1>
                        <div className="flex items-center space-x-2 text-gray-300">
                            <FontAwesomeIcon icon={faLocationDot} />
                            <span className="font-medium">{track.location}</span>
                        </div>
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
                <div className="mt-2 text-sm">
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
                </div>

            {/* Description Section */}
            <div className="p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2">
                    Track Details
                </h2>
                <p className="text-gray-300 leading-relaxed">{track.description}</p>
            </div>
        
            {(track.coordinates || track.polygon || track.polyline) && !editMode && (
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
                    
                    {/* Display Point Marker */}
                    {track.coordinates && (
                        <Marker position={[
                        track.coordinates.coordinates[1],
                        track.coordinates.coordinates[0]
                        ]} />
                    )}

                    {/* Display Polygon */}
                    {track.polygon?.coordinates && (
                        <Polygon
                        positions={track.polygon.coordinates[0].map(coord => [coord[1], coord[0]])}
                        color="blue"
                        fillOpacity={0.2}
                        />
                    )}

                    {/* Display Polyline */}
                    {track.polyline?.coordinates && (
                        <Polyline
                        positions={track.polyline.coordinates.map(coord => [coord[1], coord[0]])}
                        color="green"
                        weight={3}
                        />
                    )}
                    </MapContainer>
                </div>
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
                        {step === 1 && (
                            <TrackForm 
                                values={editValues} 
                                setValues={setEditValues}
                                handleImageChange={handleImageChange}
                            />
                        )}

                        {step === 2 && (
                            <AvailabilityForm
                                availability={availability}
                                setAvailability={setAvailability}
                                error={error}
                                setError={setError}
                            />
                        )}

                        {step === 3 && (
                            <div className="h-96 w-full rounded-lg overflow-hidden">
                                <MapSelector 
                                    position={coordinates}
                                    onPositionChange={setCoordinates}
                                    initialDrawings={drawings}
                                    onDrawingsChange={(newDrawings) => {
                                        setDrawings(newDrawings);
                                        if (newDrawings.point) {
                                            setCoordinates(newDrawings.point);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div className="flex justify-between space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => handleStepNavigation('prev')}
                                disabled={step === 1}
                                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                                    onClick={() => {
                                        setEditMode(false);
                                        setStep(1);
                                    }}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-mainBlue rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Delete Track</h3>
                            <p className="text-gray-300 mb-6">
                                Are you sure you want to permanently delete this track? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setDeleteConfirmation(false)}
                                    className=" bg-mainYellow hover:bg-yellow-200 text-mainBlue rounded-lg font-medium px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading track details...</p>
            </div>
        )}
    </div>
);
}