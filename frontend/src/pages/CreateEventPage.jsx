import React, { useState } from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import EventStepper from '../components/EventFormSteps/EventStepper';

function CreateEventPage() {
    const [values, setValues] = useState({
        name: '',
        description: '',
        date: '',
        track: '',
        location: '',
        tags: [],
        images: []
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const { t } = useTranslation();

    const validateStep = (stepNumber) => {
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
                // Add validation for step 2 here
                break;
            case 3:
                // Add validation for step 3 here
                break;
            case 4:
                // Add validation for step 4 here
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    };


    const handleStepNavigation = (direction) => {
        if (direction === 'next') {
            if (validateStep(step)) {
                setStep(prev => Math.min(prev + 1, steps.length));
            }
        } else if (direction === 'prev') {
            setStep(prev => Math.max(prev - 1, 1));
        }
    };

    const steps = [
        { number: 1, label: t('event.details') },
        { number: 2, label: t('event.tracks') },
        { number: 3, label: t('event.schedule') },
        { number: 4, label: t('event.registration') }
    ];

    const RenderEventSteps = () => {
        switch(step){
            case 1:
                return(
                    <EventDetailsStep
                        values={values}
                        setValues={setValues}
                        errors={errors}
                    />
                );
            case 2:
                return(
                    <p> second step tester</p>
                );
            case 3:
                return(
                    <p> third step tester</p>
                );
            case 4:
                return(
                    <p> fourth step tester</p>
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
                    <EventStepper steps={steps} step={step} setStep={setStep} t={t} />
            
                    {/* Main Step Content */}
                    <div className="w-full lg:w-3/4 bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-accentGray">
                        <div className="min-h-[400px]">
                            <RenderEventSteps/>
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

        