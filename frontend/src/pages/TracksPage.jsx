import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackCard from '../components/TrackCard.jsx';
import { TrackForm } from '../components/TrackForm.jsx';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faExclamationCircle, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { MapSelector } from '../components/MapSelector';
import { useTranslation } from 'react-i18next';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

export default function TracksPage() {
    const { t } = useTranslation();
    const [tracks, setTracks] = useState([]);
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        location: '',
        images: []
    });
    const [formTouched, setFormTouched] = useState({
        name: false,
        description: false,
        location: false,
        images: false
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
    const token = localStorage.getItem('token');

    const [coordinates, setCoordinates] = useState(null);
    const [distance, setDistance] = useState(0);
    const [availability, setAvailability] = useState([]);

    const [drawings, setDrawings] = useState({
        point: null,
        polyline: null
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
            const response = await axios.get(`${API_BASE_URL}/tracks?page=${page}&limit=6`);
            setTracks(response.data.tracks);
            setTotalPages(response.data.totalPages);
            setServerError('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Error fetching tracks: ${error.message}`;
            console.error('Failed to fetch tracks:', errorMessage);
            setServerError(errorMessage);
            setTracks([]);
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
            images: []
        });
        setFormTouched({
            name: false,
            description: false,
            location: false,
            images: false
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

        setFormErrors(errors);
        
        // If there are errors, mark all fields as touched to show errors
        if (!isValid) {
            setFormTouched({
                name: true,
                description: true,
                location: true,
                images: true
            });
            setError(t('tracks.form.validation.fixErrors'));
        } else {
            setError("");
        }
        
        return isValid;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        // Final validation before submission
        if (!validateStep1()) {
            setLoading(false);
            return;
        }
        
        // Validate map data
        if (!coordinates && (!drawings.polyline || drawings.polyline.length < 2)) {
            setError(t('tracks.form.validation.geometryRequired'));
            setLoading(false);
            return;
        }

        const trackData = {
            name: formValues.name, 
            description: formValues.description, 
            location: formValues.location, 
            images: formValues.images,
            availability: availability.length > 0 ? availability : undefined
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
    
        if (!token) {
            setServerError(t('tracks.form.validation.notAuthenticated'));
            setLoading(false);
            return;
        }
        
        try {
            await axios.post(
                `${API_BASE_URL}/tracks/createtrack`,
                trackData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
        <div className=' p-5 sm:p-10 bg-mainBlue min-h-screen'>
            <div className='flex justify-center mb-5'>
                <h1 className='text-4xl font-bold'>{t('tracks.exploreTracks')}</h1>
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

            <div className="relative">
                {token && (
                    <button
                        className="sm:bottom-8 sm:right-6 z-50 fixed bottom-0 h-12 w-20 rounded bg-mainRed text-white flex items-center justify-center hover:scale-110 transition-all ease-in-out duration-300 shadow-lg hover:shadow-xl"
                        onClick={toggleCreateForm}
                        aria-label={t('tracks.addTrack')}
                    >
                        <span className="text-2xl font-bold flex flex-col items-center">
                            <span className="text-xs">{t('tracks.addTrack')}</span>
                        </span>
                    </button>
                )}
            </div>

            {showCreateForm && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4 my-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('tracks.createTrack')} ({step}/3)</h3>
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
                            ) : (                           
                                <>
                                    {/* Step 3: Map Selection */}
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
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (step === 1 && !validateStep1()) return;
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
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20 justify-center'>
                    {tracks.map((track) => (
                        <TrackCard key={track._id} track={track} />
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