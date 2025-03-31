import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPencil, faTrash, faTimes, faArrowLeft, faCalendarAlt, faRuler, faCircleInfo, faChevronLeft, faChevronRight, faMapMarkerAlt, faClock, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { MapSelector, startIcon, endIcon} from '../components/MapSelector';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { TrackForm } from '../components/TrackForm.jsx';
import JoiningRequestForm from '../components/JoiningRequestForm.jsx';
import UserContact from "../components/UserContact.jsx";
import { useTranslation } from 'react-i18next';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
    <div className="z-0 h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-700">
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
            <Polyline positions={polylinePositions} pathOptions={{ color: '#FF0000', weight: 4 }} />
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
    const { t } = useTranslation();
    const { id: trackId } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();
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
        polyline: null,
        joining_enabled: false,
        joining_requirements: ''
    });
    const [editValues, setEditValues] = useState({
        name: "",
        description: "",
        location: "",
        images: [],
        joining_enabled: track.joining_enabled ?? false,
        joining_requirements: track.joining_requirements ?? ''
    });
    const [error, setError] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [serverError, setServerError] = useState("");
    const [step, setStep] = useState(1);
    const [availability, setAvailability] = useState([]);
    const [drawings, setDrawings] = useState({
        point: null,
        polyline: null,
        distance: null
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'map', or 'availability'
    const [registerForm, setRegisterForm] = useState(false);
    const [content, setContent] = useState('');
    const [requests, setRequests] = useState([]);
    // Format distance with memoization
    const formattedDistance = useMemo(() => {
        return `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;
    }, [track.distance]);

    // Fetch track data
    const getTrack = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/tracks/${trackId}`);
            const trackData = response.data.track;
            setTrack(trackData);
            
            // Initialize edit values
            setEditValues({
                name: trackData.name,
                description: trackData.description,
                location: trackData.location,
                images: trackData.images,
                joining_enabled: trackData.joining_enabled,
                joining_requirements: trackData.joining_requirements
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
            setServerError(error.response?.data?.message || t('tracks.error'));
        } finally {
            setLoading(false);
        }
    }, [trackId, t]);

    // Load track data on component
    useEffect(() => {
        getTrack();
    }, [getTrack]);

    // Validate each step of the form
    const validateStep = useCallback(() => {
        switch(step) {
            case 1:
                if (!editValues.name?.trim() || editValues.name.length < 5) {
                    setError(t('tracks.form.validation.nameTooShort'));
                    return false;
                }
                if (!editValues.description?.trim() || editValues.description.length < 10) {
                    setError(t('tracks.form.validation.descriptionTooShort'));
                    return false;
                }
                if (!editValues.location?.trim() || editValues.location.length < 5) {
                    setError(t('tracks.form.validation.locationTooShort'));
                    return false;
                }
                if (!editValues.images || editValues.images.length === 0) {
                    setError(t('tracks.form.validation.imageRequired'));
                    return false;
                }
                return true;
            
            case 2:
                return true;
                
            case 3:
                if (!drawings.point && (!drawings.polyline || drawings.polyline.length < 2)) {
                    setError(t('tracks.form.validation.geometryRequired'));
                    return false;
                }
                return true;

            default:
                return true;
        }
    }, [step, editValues, drawings, t]);

    // Handle navigation between steps
    const handleStepNavigation = useCallback((direction) => {
        if (direction === 'next') {
            if (!validateStep()) return;
            setStep(prev => Math.min(prev + 1, 4));
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
        if (track.images.length === 0) {
            setCurrentImageIndex(0);
        } else if (currentImageIndex >= track.images.length) {
            setCurrentImageIndex(track.images.length - 1);
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
                polyline: null,
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
                setError(t('tracks.form.validation.geometryRequired'));
                return;
            }
    
            await axiosInstance.patch(
                `/tracks/${trackId}`,
                updateData
            );
    
            setEditMode(false);
            toast.success(t('tracks.form.successEdit'));
            setStep(1);
            getTrack();
        } catch (error) {
            setError(error.response?.data?.message || t('tracks.error'));
        }
    }, [editValues, availability, drawings, trackId, getTrack, t]);

    // Delete track
    const handleDelete = useCallback(async () => {
        try {
            await axiosInstance.delete(`/tracks/${trackId}`);
            toast.success(t('tracks.form.successDelete'));
            navigate("/tracks");
        } catch (error) {
            console.error("Error deleting track:", error);
            setError(error.response?.data?.message || t('tracks.error'));
        }
    }, [trackId, navigate, t]);

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
            case 4:
                return <JoiningRequestForm values={editValues} setValues={setEditValues} />;
            default:
                return null;
        }
    }, [step, editValues, drawings, availability, error, handleImageChange, handleDrawingsChange, currentImageIndex, t]);

    // Function to format time in 12-hour format
    const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(":");
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        return `${hourNum % 12 || 12}:${minute} ${ampm}`;
    };

    const openRegisterForm = () => {
        setRegisterForm(!registerForm);
    };

    const sendRequest = async (requestContent) => {
        if (!userId) {
            setError(t('tracks.error.notLoggedIn'));
            return;
        }
        try {
            const response = await axiosInstance.post("/track-requests/create-request", { 
                trackId: track._id,
                content: requestContent
            });
            setRequests(response.data);
            setContent(''); 
            setRegisterForm(false);
        } catch (error) {
            console.error('Error details:', error.response?.data);
            setError(error.response?.data?.message || t('common.error'));
        }
    }
    // Render loading state
    if (loading) {
        return (
            <div className="text-center py-12 min-h-screen flex items-center justify-center">
                <div className="space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400 text-lg">{t('tracks.loading')}</p>
                </div>
            </div>
        );
    }

    // Render tab content
    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <div className="bg-accentBlue p-6 rounded-xl shadow-lg min-h-56">
                        <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                            <FontAwesomeIcon icon={faCircleInfo} className="mr-2 text-mainYellow" />
                            {t('tracks.details')}
                        </h2>
                        <p className="text-white leading-7 tracking-wide text-lg whitespace-pre-line break-words">{track.description}</p>
                    </div>
                );
            case 'map':
                return (
                !editMode && (
                    (track.coordinates || track.polyline) ? (
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-mainYellow" />
                                {t('tracks.map')}
                            </h2>
                            <TrackMap 
                                coordinates={track.coordinates} 
                                polyline={track.polyline} 
                            />
                        </div>
                    ) : (
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
                            <p className="text-center text-gray-400 py-8">{t('tracks.noMapData')}</p>
                        </div>
                    )
                ));
            case 'availability':
                return (
                    <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-2 text-mainYellow" />
                            {t('tracks.hours')}
                        </h2>
                        {track.availability && track.availability.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {track.availability.map((slot, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300 border border-gray-700 shadow-md"
                                    >
                                        <div className="text-center mb-2">
                                            <span className="font-bold text-white text-lg">
                                                {slot.startDay === slot.endDay
                                                    ? t(`availability.days.${slot.startDay}`)
                                                    : `${t(`availability.days.${slot.startDay}`)} - ${t(`availability.days.${slot.endDay}`)}`}
                                            </span>
                                        </div>
                                        <div className="text-center flex items-center">
                                            <FontAwesomeIcon icon={faClock} className="mr-2 text-mainYellow" />
                                            <span className="text-gray-300 font-semibold">
                                                {formatTime(slot.open_time)} - {formatTime(slot.close_time)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">{t('tracks.noAvailability')}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-mainBlue">
            {serverError && (
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="bg-mainRed/20 border border-mainRed text-white p-6 rounded-lg">
                        <p className="text-center text-lg">{serverError}</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Hero section with image */}
                <div className="relative group">
                    <div className="relative h-[32rem] md:h-[40rem] lg:h-[48rem] rounded-tr-xl rounded-tl-xl overflow-hidden shadow-xl border border-gray-700">
                        {track.images.length > 0 && track.images[currentImageIndex] ? (
                            <img 
                                src={track.images[currentImageIndex].data} 
                                alt={track.name}
                                className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accentBlue text-gray-400">
                                {t('tracks.noImages')}
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        
                        {/* Image pagination */}
                        {track.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {track.images.map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-mainYellow' : 'bg-white/50'}`}
                                        aria-label={t('tracks.goToImage', { number: idx + 1 })}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {track.images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPreviousImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                                    aria-label={t('tracks.previousImage')}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button
                                    onClick={goToNextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                                    aria-label={t('tracks.nextImage')}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* Track title and basic info overlay */}
                    <div className="absolute bottom-6 left-6 space-y-2 max-w-3/4">
                        <h1 className="text-4xl font-bold drop-shadow-lg">{track.name}</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-black/40 rounded-full px-3 py-1">
                                <FontAwesomeIcon icon={faLocationDot} className="text-mainYellow" />
                                <span className="font-medium">{track.location}</span>
                            </div>
                            {track.distance > 0 && (
                                <div className="flex items-center space-x-2 bg-black/40 rounded-full px-3 py-1">
                                    <FontAwesomeIcon icon={faRuler} className="text-mainYellow" />
                                    <span className="font-medium">{formattedDistance}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Contact Card */}
                <UserContact created_by={track.created_by} />


                {/* Action buttons for track owner */}
                <div className="flex space-x-4 justify-end mt-8">
                    {userId === track.created_by?._id && (
                        <>
                        <button
                            onClick={() => setEditMode(true)}
                            className="font-semibold px-6 py-2 rounded-lg hover:text-mainRed transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            {t('tracks.editTrack')}
                        </button>
                        <button
                            onClick={() => setDeleteConfirmation(true)}
                            className="font-semibold px-6 py-2 rounded-lg hover:text-mainRed transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2"/>
                            {t('tracks.deleteTrack')}
                        </button>
                        </>
                    )}
                    {track.joining_enabled === true && userId && userId !== track.created_by._id && (
                        <>
                        <button className="flex items-center gap-2 bg-mainRed hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl" 
                            onClick={openRegisterForm}>
                            {t('tracks.openRequestForm')}
                        </button>
                        {registerForm && (
                            <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" onClick={openRegisterForm}>
                                <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4 my-8" onClick={(e) => e.stopPropagation()}>
                                    <error>{error}</error>
                                    <div className="flex justify-between items-center">
                                        <h3>Request form or something</h3>
                                        <p className="cursor-pointer font-bold text-gray-300 hover:text-white" onClick={openRegisterForm}>X</p>
                                    </div>
                                    <p className="text-gray-300">{track.joining_requirements}</p>
                                    <input className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-mainRed focus:ring-2 focus:ring-mainRed transition-all duration-200 outline-none" type="text" value={content} onChange={(e) => setContent(e.target.value)} />
                                    <div className="flex justify-between">
                                        <button className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors" onClick={() => sendRequest(content)}>Send</button>
                                        <button className="bg-mainRed hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors" onClick={openRegisterForm}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
                

                {/* Tabs Navigation */}
                <div className="flex border-gray-700 mt-8">
                    <button 
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'details' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
                        {t('tracks.details')}
                    </button>
                    <button 
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'map' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('map')}
                    >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        {t('tracks.map')}
                    </button>
                    <button 
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'availability' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('availability')}
                    >
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        {t('tracks.hours')}
                    </button>
                </div>

                {/* Tab Content */}
                {renderTabContent()}

                {/* Edit Modal */}
                {editMode && (
                    <div className="fixed z-50 inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                        <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4 shadow-2xl border border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">{t('tracks.editTrack')} <span className="text-mainYellow">({step}/4)</span></h3>
                                <button 
                                    type="button" 
                                    onClick={resetEditState} 
                                    className="text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {error && (
                                <div className="bg-mainRed/20 border border-mainRed text-white p-4 rounded-lg">
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Step Content */}
                            <div className=" p-4 rounded-lg">
                                {renderEditStep()}
                            </div>

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
                                    {t('tracks.back')}
                                </button>
                                <div className="flex-grow"></div>
                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={() => handleStepNavigation('next')}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {t('tracks.next')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {t('tracks.saveChanges')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={resetEditState}
                                    className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {t('tracks.cancel')}
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
                        title={t('tracks.deleteTrack')}
                        message={t('tracks.confirmDelete')}
                        confirmText={t('tracks.confirmDelete')}
                        cancelText={t('tracks.cancel')}
                    />
                )}
            </div>
        </div>
    );
}