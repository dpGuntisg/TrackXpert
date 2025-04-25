import React, { useState, useCallback } from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { EventTrackSelectionStep } from '../components/EventFormSteps/EventTrackSelectionStep';
import { EventRegistrationStep } from '../components/EventFormSteps/EventRegistrationStep';
import EventStepper from '../components/EventFormSteps/EventStepper';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function CreateEventPage() {
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
    const { t } = useTranslation();

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

    const validateStep = useCallback((stepNumber) => {
        const newErrors = {};
        let isValid = true;

        switch(stepNumber) {
            case 1:
                if (!values.name || values.name.length < 5) {
                    newErrors.name = t('tracks.form.validation.nameTooShort');
                    isValid = false;
                }
                if (!values.description || values.description.length < 10) {
                    newErrors.description = t('tracks.form.validation.descriptionTooShort');
                    isValid = false;
                }
                if (!values.eventDate?.startDate || !values.eventDate?.endDate) {
                    newErrors.eventDate = t('event.form.validation.eventDateRequired');
                    isValid = false;
                }
                if(!values.tags || values.tags.length === 0){
                    newErrors.tags = t('tracks.form.validation.tagRequired');
                    isValid = false;
                }
                if (!values.images || values.images.length === 0) {
                    newErrors.images = t('tracks.form.validation.imageRequired');
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
                    />
                );
            default:
                return null;
        }
    };
   
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-mainYellow">{t('event.createEvent')}</h1>
                    <p className="mt-2 text-gray-400">{t('event.createEventDescription')}</p>
                </header>

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
                                onClick={() => handleStepNavigation('next')}
                                className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center order-1 sm:order-2 bg-mainRed hover:bg-red-700"
                            >
                                {step === steps.length ? (
                                    <span className="flex items-center">
                                        {t('common.finish') || 'Finish'}
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
            </div>
        </div>
    );
}

export default CreateEventPage;