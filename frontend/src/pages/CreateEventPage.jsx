import React, { useState, useCallback, useEffect } from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { EventTrackSelectionStep } from '../components/EventFormSteps/EventTrackSelectionStep';
import { EventRegistrationStep } from '../components/EventFormSteps/EventRegistrationStep';
import EventStepper from '../components/EventFormSteps/EventStepper';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CreateEventPage({ mode = 'create' }) {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { userId, role } = useAuth();
    const [values, setValues] = useState({
        name: '',
        description: '',
        eventDate: {
            startDate: null,
            endDate: null
        },
        registrationDate: {
            startDate: null,
            endDate: null
        },
        track: '',
        location: '',
        tags: [],
        images: [],
        participants: '',
        unlimitedParticipants: false,
        registrationInstructions: '',
        requireManualApproval: false,
        generatePdfTickets: false
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(mode === 'edit');
    const [isAuthorized, setIsAuthorized] = useState(true);
    const { t } = useTranslation();

    // Check if user has tracks when component mounts
    useEffect(() => {
        const checkUserTracks = async () => {
            if (mode === 'create') {
                try {
                    const response = await axiosInstance.get(`/tracks/profile/${userId}/tracks`);
                    const userTracks = response.data.tracks;
                    
                    if (!userTracks || userTracks.length === 0) {
                        toast.error(t('event.noTracksError'));
                        navigate('/events');
                    }
                } catch (error) {
                    console.error('Error checking user tracks:', error);
                    toast.error(t('common.error'));
                    navigate('/events');
                }
            }
        };

        checkUserTracks();
    }, [mode, userId, navigate, t]);

    // Fetch event data if in edit mode
    useEffect(() => {
        if (mode === 'edit' && eventId) {
            const fetchEvent = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`/events/${eventId}`);
                    const eventData = response.data.event;
                    
                    // Check if the current user is the event owner or admin
                    if (eventData.created_by?._id !== userId && role !== "admin") {
                        setIsAuthorized(false);
                        toast.error(t('event.unauthorizedEdit'));
                        setTimeout(() => {
                            navigate('/events');
                        }, 2000);
                        return;
                    }
                    
                    // Format the data for the form
                    setValues({
                        name: eventData.name || '',
                        description: eventData.description || '',
                        eventDate: {
                            startDate: eventData.date?.startDate ? new Date(eventData.date.startDate) : null,
                            endDate: eventData.date?.endDate ? new Date(eventData.date.endDate) : null
                        },
                        registrationDate: {
                            startDate: eventData.registrationDate?.startDate ? new Date(eventData.registrationDate.startDate) : null,
                            endDate: eventData.registrationDate?.endDate ? new Date(eventData.registrationDate.endDate) : null
                        },
                        track: eventData.tracks?.map(track => track._id) || [],
                        location: eventData.location || '',
                        tags: eventData.tags || [],
                        images: eventData.images || [],
                        participants: eventData.maxParticipants || '',
                        unlimitedParticipants: eventData.unlimitedParticipants || false,
                        registrationInstructions: eventData.registrationInstructions || '',
                        requireManualApproval: eventData.requireManualApproval || false,
                        generatePdfTickets: eventData.generatePdfTickets || false
                    });
                } catch (error) {
                    console.error('Error fetching event:', error);
                    toast.error(error.response?.data?.message || t('common.error'));
                } finally {
                    setLoading(false);
                }
            };
            
            fetchEvent();
        }
    }, [mode, eventId, t, userId, navigate, role]);

    // Use useCallback to prevent function recreation on every render
    const setValuesCallback = useCallback((valuesUpdater) => {
        setValues(prevValues => {
            // If it's a function, call it with prevValues
            if (typeof valuesUpdater === 'function') {
                return valuesUpdater(prevValues);
            }
            // Otherwise, it's an object to merge
            return { ...prevValues, ...valuesUpdater };
        });
    }, []);

    const handleSubmit = async () => {
        if (!validateStep(step)) {
            return;
        }
        try {
            const formData = {
                ...values,
                date: values.eventDate,
                registrationDate: values.registrationDate,
                tracks: Array.isArray(values.track) ? values.track : [values.track]
            };
            
            if (mode === 'create') {
                await axiosInstance.post("/events/createevent", formData);
                toast.success(t('event.createdSuccessfully'));
            } else {
                await axiosInstance.patch(`/events/${eventId}`, formData);
                toast.success(t('event.updatedSuccessfully'));
            }
            
            navigate('/events');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const validateStep = useCallback((stepNumber) => {
        const newErrors = {};
        let isValid = true;

        switch(stepNumber) {
            case 1:
                if (!values.name || values.name.length < 5) {
                    newErrors.name = t('event.form.validation.nameTooShort');
                    isValid = false;
                }
                if (!values.description || values.description.length < 10) {
                    newErrors.description = t('event.form.validation.descriptionTooShort');
                    isValid = false;
                }
                if (!values.eventDate?.startDate || !values.eventDate?.endDate) {
                    newErrors.eventDate = t('event.form.validation.eventDateRequired');
                    isValid = false;
                }
                if (!values.tags || values.tags.length === 0) {
                    newErrors.tags = t('event.form.validation.eventTypeRequired');
                    isValid = false;
                }
                if (!values.images || values.images.length === 0) {
                    newErrors.images = t('event.form.validation.tooManyImages');
                    isValid = false;
                }
                break;
            case 2:
                if (!values.track || values.track.length === 0) {
                    newErrors.track = t('event.form.validation.trackRequired');
                    isValid = false;
                }
                break;
            case 3:
                if (!values.registrationDate?.startDate || !values.registrationDate?.endDate) {
                    newErrors.registrationDate = t('event.form.validation.registrationDateRequired');
                    isValid = false;
                }
                if (values.registrationDate?.endDate > values.eventDate?.startDate) {
                    newErrors.registrationDate = t('event.form.validation.registrationEndBeforeEventStart');
                    isValid = false;
                }
                if (!values.unlimitedParticipants) {
                    if (values.participants === '' || values.participants === undefined) {
                        newErrors.participants = t('event.form.validation.participantsRequired');
                        isValid = false;
                    } else if (parseInt(values.participants, 10) <= 0) {
                        newErrors.participants = t('event.form.validation.participantsPositive');
                        isValid = false;
                    } else if (parseInt(values.participants, 10) > 100) {
                        newErrors.participants = t('event.form.validation.participantsTooMany');
                        isValid = false;
                    }
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    }, [values, t]);

    const handleStepNavigation = useCallback((direction) => {
        if (direction === 'next') {
            if (validateStep(step)) {
                setStep(prev => Math.min(prev + 1, steps.length));
            }
        } else if (direction === 'prev') {
            setStep(prev => Math.max(prev - 1, 1));
        }
    }, [step, validateStep]);

    const steps = [
        { number: 1, label: t('event.details') },
        { number: 2, label: t('event.tracks') },
        { number: 3, label: t('event.registration') }
    ];

    const handleTrackSelectionChange = (updatedTracks) => {
        setValuesCallback({ track: updatedTracks });
    };

    const renderStep = () => {
        switch(step){
            case 1:
                return(
                    <EventDetailsStep
                        values={values}
                        setValues={setValuesCallback}
                        errors={errors}
                        currentImageIndex={currentImageIndex}
                        setCurrentImageIndex={setCurrentImageIndex}
                    />
                );
            case 2:
                return(
                    <EventTrackSelectionStep
                        selectedTracks={values.track}
                        onSelectionChange={handleTrackSelectionChange}
                        errors={errors}
                    />
                );
            case 3:
                return(
                    <EventRegistrationStep
                        values={values}
                        setValues={setValuesCallback}
                        errors={errors}
                        setErrors={setErrors}
                    />
                );
            default:
                return null;
        }
    };
   
    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-mainRed mb-4">{t('event.unauthorizedEdit')}</h1>
                    <p className="text-gray-400 mb-6">{t('event.redirecting')}</p>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-mainYellow">
                        {mode === 'create' ? t('event.createEvent') : t('event.editEvent')}
                    </h1>
                    <p className="mt-2 text-gray-400">
                        {mode === 'create' ? t('event.createEventDescription') : t('event.editEventDescription')}
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed"></div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
                        {/* Sidebar */}
                        <EventStepper 
                            steps={steps} 
                            step={step} 
                            setStep={setStep} 
                            t={t} 
                        />
                
                        {/* Main Step Content */}
                        <div className="w-full lg:w-3/4 bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-accentGray">
                            <div className="min-h-[400px]">
                                {renderStep()}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row sm:justify-between mt-8 gap-4">
                                <button
                                    onClick={() => handleStepNavigation('prev')}
                                    className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-3 rounded-lg font-medium transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                                    disabled={step === 1}
                                >
                                    <span className="flex items-center justify-center">
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                        {t('tracks.back') || 'Back'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (step === steps.length) {
                                            handleSubmit();
                                        } else {
                                            handleStepNavigation('next');
                                        }
                                    }}
                                    className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center order-1 sm:order-2 bg-mainRed hover:bg-red-700"
                                >
                                    {step === steps.length ? (
                                        <span className="flex items-center">
                                            {mode === 'create' ? t('common.finish') : t('common.save')}
                                            <FontAwesomeIcon icon={faCheckCircle} className="ml-2" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            {t('tracks.next') || 'Next'}
                                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateEventPage;