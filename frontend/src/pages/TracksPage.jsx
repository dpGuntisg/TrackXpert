import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import TrackCard from '../components/TrackCard.jsx';
import { TrackForm } from '../components/TrackForm.jsx';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faExclamationCircle, faCheckCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MapSelector } from '../components/MapSelector';
import { useTranslation } from 'react-i18next';
import SearchAndFilter from '../components/SearchAndFilter';
import { useAuth } from '../context/AuthContext';

// English day names for backend
const ENGLISH_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Gets all days in a range, handling week wraparounds.    
const getDaysInRange = (startDay, endDay) => {
    const startIndex = ENGLISH_DAYS.indexOf(startDay);
    const endIndex = ENGLISH_DAYS.indexOf(endDay);
    return endIndex >= startIndex
        ? ENGLISH_DAYS.slice(startIndex, endIndex + 1)
        : [...ENGLISH_DAYS.slice(startIndex), ...ENGLISH_DAYS.slice(0, endIndex + 1)];
};

export default function TracksPage() {
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [tracks, setTracks] = useState([]);
    const [originalTracks, setOriginalTracks] = useState([]);
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        location: '',
        images: [],
        tags: [],
        joining_enabled: false,
        joining_details: ''
    });
    const [formTouched, setFormTouched] = useState({
        name: false,
        description: false,
        location: false,
        images: false,
        tags: false,
        joining_details: false
    });
    const [formErrors, setFormErrors] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    const [coordinates, setCoordinates] = useState(null);
    const [distance, setDistance] = useState(0);
    const [availability, setAvailability] = useState([]);

    const [drawings, setDrawings] = useState({
        point: null,
        polyline: null
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        name: '',
        location: '',
        tags: [],
        minLength: '',
        maxLength: '',
        availability: {days: [],}
    });

    const handleDrawingsChange = (newDrawings) => {
        setDrawings(newDrawings);
        if (newDrawings.distance) {
            setDistance(newDrawings.distance);
        }
    };    

    const getTracks = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/tracks?page=${page}&limit=6`);
            setTracks(response.data.tracks);
            setOriginalTracks(response.data.tracks);
            setTotalPages(response.data.totalPages);
            setServerError('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Error fetching tracks: ${error.message}`;
            console.error('Failed to fetch tracks:', errorMessage);
            setServerError(errorMessage);
            setTracks([]);
            setOriginalTracks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTracks(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleCreateForm = () => { 
        setShowCreateForm(!showCreateForm);
        setError(''); 
        setSuccess('');
        // Reset form when opening
        if (!showCreateForm) {
            resetForm();
        }
    };

    const resetForm = () => {
        setFormValues({
            name: '',
            description: '',
            location: '',
            images: [],
            tags: [],
            joining_enabled: false,
            joining_details: ''
        });
        setFormTouched({
            name: false,
            description: false,
            location: false,
            images: false,
            tags: false,
            joining_details: false
        });
        setFormErrors({});
        setCoordinates(null);
        setAvailability([]);
        setDrawings({
            point: null,
            polyline: null
        });
        setStep(1);
        setError('');
    };

    const validateStep1 = () => {
        const errors = {};
        let isValid = true;

        if (!formValues.name || formValues.name.length < 5) {
            errors.name = t('tracks.form.validation.nameTooShort');
            isValid = false;
        } else if (formValues.name.length > 100) {
            errors.name = t('tracks.form.validation.nameTooLong');
            isValid = false;
        }

        if (!formValues.description || formValues.description.length < 10) {
            errors.description = t('tracks.form.validation.descriptionTooShort');
            isValid = false;
        } else if (formValues.description.length > 15000) {
            errors.description = t('tracks.form.validation.descriptionTooLong');
            isValid = false;
        }

        if (!formValues.location || formValues.location.length < 5) {
            errors.location = t('tracks.form.validation.locationTooShort');
            isValid = false;
        } else if (formValues.location.length > 50) {
            errors.location = t('tracks.form.validation.locationTooLong');
            isValid = false;
        }

        if (!formValues.images || formValues.images.length === 0) {
            errors.images = t('tracks.form.validation.imageRequired');
            isValid = false;
        }

        // Validate tags
        if (!formValues.tags || formValues.tags.length === 0) {
            errors.tags = t('tracks.form.validation.tagsRequired');
            isValid = false;
        } else {
            // Check track type tags limit
            const trackTypeTags = formValues.tags.filter(tag => 
                ['rally_stage', 'hill_climb', 'circuit', 'off_road', 'circuit_race'].includes(tag)
            );
            if (trackTypeTags.length > 2) {
                errors.tags = t('tracks.form.validation.tooManyTrackTypeTags');
                isValid = false;
            }

            // Check total tags limit
            if (formValues.tags.length > 5) {
                errors.tags = t('tracks.form.validation.tooManyTags');
                isValid = false;
            }
        }

        setFormErrors(errors);
        
        if (!isValid) {
            setFormTouched({
                name: true,
                description: true,
                location: true,
                images: true,
                tags: true,
            });
            setError(t('tracks.form.validation.fixErrors'));
        } else {
            setError("");
        }
        
        return isValid;
    };

    const validateStep3 = () => {
        if (!coordinates && (!drawings.polyline || drawings.polyline.length < 2)) {
            setError(t('tracks.form.validation.geometryRequired'));
            return false;
        }
        setError("");
        return true;
    };

    const validateCurrentStep = () => {
        switch (step) {
            case 1:
                return validateStep1();
            case 2:
                return true;
            case 3:
                return validateStep3();
            default:
                return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Create track data object
        const trackData = {
            ...formValues,
            availability,
            coordinates: null,
            polyline: null
        };
      
        // Send coordinates as [lng, lat] directly
        if (coordinates) {
            trackData.longitude = coordinates[1]; 
            trackData.latitude = coordinates[0];  
        }
      
        if (drawings.polyline && drawings.polyline.length > 1) {
            trackData.polyline = drawings.polyline; 
            trackData.distance = drawings.distance;
        }
        
        try {
            await axiosInstance.post("/tracks/createtrack", trackData);
            setSuccess(t('tracks.form.success'));
            resetForm();
            setShowCreateForm(false);
            getTracks(currentPage);
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('tracks.form.error');
            console.error('Track creation error:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        applyFilters(query, filters);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        applyFilters(searchQuery, newFilters);
    };

    const applyFilters = (query = searchQuery, currentFilters = filters) => {
        let filteredTracks = [...originalTracks];

        // Apply search filter
        if (query && query.trim()) {
            filteredTracks = filteredTracks.filter(track => 
                track.name.toLowerCase().includes(query.toLowerCase()) ||
                track.location.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply additional filters if provided
        if (currentFilters) {
            // Apply tag filters
            if (currentFilters.tags && currentFilters.tags.length > 0) {
                filteredTracks = filteredTracks.filter(track => 
                    currentFilters.tags.some(tag => track.tags.includes(tag))
                );
            }

            // Apply length filters
            if (currentFilters.minLength) {
                filteredTracks = filteredTracks.filter(track => 
                    track.distance >= parseFloat(currentFilters.minLength)
                );
            }
            if (currentFilters.maxLength) {
                filteredTracks = filteredTracks.filter(track => 
                    track.distance <= parseFloat(currentFilters.maxLength)
                );
            }

            // Apply availability filters
            if (currentFilters.availability) {
                if (currentFilters.availability.filterType === 'single' && currentFilters.availability.days.length > 0) {
                    // Single day filtering
                    filteredTracks = filteredTracks.filter(track => {
                        if (!track.availability || track.availability.length === 0) return false;
                        
                        return currentFilters.availability.days.some(selectedDay => {
                            return track.availability.some(slot => {
                                const slotDays = getDaysInRange(slot.startDay, slot.endDay);
                                return slotDays.includes(selectedDay);
                            });
                        });
                    });
                } else if (currentFilters.availability.filterType === 'range' && 
                          currentFilters.availability.rangeDays.from && 
                          currentFilters.availability.rangeDays.to) {
                    // Range-based filtering
                    filteredTracks = filteredTracks.filter(track => {
                        if (!track.availability || track.availability.length === 0) return false;
                        
                        const fromDay = currentFilters.availability.rangeDays.from;
                        const toDay = currentFilters.availability.rangeDays.to;
                        
                        return track.availability.some(slot => {
                            const slotDays = getDaysInRange(slot.startDay, slot.endDay);
                            const fromInRange = slotDays.includes(fromDay);
                            const toInRange = slotDays.includes(toDay);
                            return fromInRange && toInRange;
                        });
                    });
                }
            }
        }

        setTracks(filteredTracks);
    };

    const handleLikeChange = (trackId, isLiked, updatedLikes) => {
        setTracks(prevTracks => 
            prevTracks.map(track => {
                if (track._id === trackId) {
                    return {
                        ...track,
                        likes: updatedLikes || track.likes // Use provided likes array or keep existing
                    };
                }
                return track;
            })
        );
    };

    if (loading && !tracks.length) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                    <p className="text-lg">{t('tracks.loading')}</p>
                </div>
            </div>
        );
    }

    if (serverError && !tracks.length) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center text-center max-w-lg">
                    <div className="text-mainRed text-5xl mb-4">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                    </div>
                    <p className="text-3xl mb-3">{t('tracks.error')}</p>
                    <p className="text-lg mb-6">{serverError}</p>
                    <button 
                        onClick={() => {
                            setServerError('');
                            getTracks(1);
                        }}
                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium"
                    >
                        {t('tracks.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='p-5 sm:p-10 bg-mainBlue min-h-screen'>
            <div className="flex items-center justify-between mb-10">
                <SearchAndFilter 
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    type="track"
                    searchPlaceholder={t('tracks.searchPlaceholder')}
                />
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <h1 className="text-4xl font-bold">{t('tracks.title')}</h1>
                </div>
                {userId && (
                    <button
                        onClick={toggleCreateForm}
                        className="flex items-center gap-2 bg-mainRed hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        aria-label={t('tracks.addTrack')}
                    >
                        <span className="text-xl">+</span>
                        <span className="hidden sm:inline">{t('tracks.addTrack')}</span>
                    </button>
                )}
            </div>

            {serverError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 text-red-500">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <p className="text-sm font-medium">{serverError}</p>
                    </div>
                    <button 
                        onClick={() => {
                            setServerError('');
                            getTracks(currentPage);
                        }}
                        className="text-mainYellow hover:text-yellow-400 text-sm mt-2 font-medium"
                    >
                        {t('tracks.retry')}
                    </button>
                </div>
            )}

            {showCreateForm && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4 my-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('tracks.createTrack')} ({step}/4)</h3>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    resetForm();
                                }}
                                className="text-gray-300 hover:text-white"
                                aria-label={t('tracks.cancel')}
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                        {/* Global error message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center gap-2 text-red-500">
                                    <FontAwesomeIcon icon={faExclamationCircle} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Success message */}
                        {success && (
                            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2 text-green-500">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <p className="text-sm font-medium">{success}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {step === 1 ? (
                                <TrackForm 
                                    values={formValues}
                                    setValues={setFormValues}
                                    errors={formErrors}
                                    touched={formTouched}
                                />
                            ) : step === 2 ? (
                                <AvailabilityForm 
                                    availability={availability}
                                    setAvailability={setAvailability}
                                    error={error}
                                    setError={setError}
                                />
                            ) : step === 3 ? (
                                <>
                                    <div className="h-96 w-full rounded-lg overflow-hidden">
                                        <MapSelector 
                                            position={coordinates}
                                            onPositionChange={setCoordinates}
                                            onDrawingsChange={handleDrawingsChange}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {t('tracks.form.mapInstructions')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    {/* Joining enabled toggle */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormValues(prev => ({ ...prev, joining_enabled: !prev.joining_enabled }))}
                                                className={`relative flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                                    formValues.joining_enabled 
                                                        ? 'bg-mainRed border-mainRed' 
                                                        : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                            >
                                                {formValues.joining_enabled && (
                                                    <FontAwesomeIcon 
                                                        icon={faCheck} 
                                                        className="h-3 w-3 text-white" 
                                                    />
                                                )}
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-300">{t('tracks.form.joiningEnabled')}</h3>
                                                <p className="text-sm text-gray-400">{t('tracks.form.joiningDescription')}</p>
                                            </div>
                                        </div>

                                        {formValues.joining_enabled && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    {t('tracks.form.joiningDetails')}
                                                </label>
                                                <textarea
                                                    value={formValues.joining_details}
                                                    onChange={(e) => setFormValues(prev => ({ ...prev, joining_details: e.target.value }))}
                                                    placeholder={t('tracks.form.joiningDetailsPlaceholder')}
                                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-mainRed focus:ring-2 focus:ring-mainRed transition-all duration-200 outline-none"
                                                    rows="4"
                                                />
                                                <p className="mt-1 text-sm text-gray-400">
                                                    {t('tracks.form.joiningDetailsHelp')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between space-x-3 pt-4">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                        {t('tracks.back')}
                                    </button>
                                )}
                                <div className="flex-grow"></div>
                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!validateCurrentStep()) return;
                                            setStep(step + 1);
                                        }}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                        disabled={loading}
                                    >
                                        {t('tracks.next')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-mainBlue border-t-transparent rounded-full animate-spin"></div>
                                                {t('tracks.creating')}
                                            </>
                                        ) : t('tracks.createTrack')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetForm();
                                    }}
                                    className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                    disabled={loading}
                                >
                                    {t('tracks.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tracks.length === 0 && !loading ? (
                <div className="text-center py-16">
                    <p className="text-2xl mb-4">{t('tracks.noTracks')}</p>
                    <p className="text-gray-400">{t('tracks.beFirst')}</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 max-w-[1400px] mx-auto px-4'>
                    {tracks.map((track) => (
                        <TrackCard 
                            key={track._id} 
                            track={track} 
                            onLikeChange={(isLiked) => handleLikeChange(track._id, isLiked, track.likes)}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="inline-flex rounded-md shadow-sm">
                        {currentPage > 1 && (
                            <button
                                className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-l-lg"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={loading}
                            >
                                {t('tracks.previous')}
                            </button>
                        )}
                        <span className="px-4 py-2 text-sm font-medium bg-gray-800">
                            {currentPage} {t('tracks.of')} {totalPages}
                        </span>
                        {currentPage < totalPages && (
                            <button
                                className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-r-lg"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={loading}
                            >
                                {t('tracks.next')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}