import React, { useState } from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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
    const [touched, setTouched] = useState({
        name: false,
        description: false,
        date: false,
        track: false,
        location: false
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const { t } = useTranslation();

    const steps = [
        { number: 1, label: "Details" },
        { number: 2, label: "Tracks" },
        { number: 3, label: "Advanced Settings" },
        { number: 4, label: "Branding & Design" }
    ];

    const handleStepNavigation = (direction) => {
        if (direction === 'next') {
            setStep(prev => Math.min(prev + 1, steps.length));
        } else if (direction === 'prev') {
            setStep(prev => Math.max(prev - 1, 1));
        }
    };

    const RenderEventSteps = () => {
        switch(step){
            case 1:
                return(
                    <EventDetailsStep
                        values={values}
                        setValues={setValues}
                        errors={errors}
                        touched={touched}
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
                    <div className="w-full lg:w-1/4 bg-gray-800/30 rounded-xl p-4 mb-6 lg:mb-0 border border-accentGray">
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {steps.map((item) => (
                                <div
                                    key={item.number}
                                    className={`flex items-center mb-2 py-3 px-4 rounded-lg transition-all duration-200 min-w-fit
                                        ${step === item.number ? 'bg-mainRed/30' : 'hover:bg-gray-700/50'}`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full
                                        ${step === item.number ? 'bg-mainRed text-white border-2 border-mainRed'
                                            : item.number < step
                                                ? 'bg-mainYellow text-mainBlue border-2 border-mainYellow'
                                                : 'bg-mainBlue/20 text-gray-300 border-2 border-accentBlue'}`}
                                    >
                                        {item.number < step ? (
                                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                        ) : (
                                            item.number
                                        )}
                                    </div>
                                    <span
                                        className={`ml-3 ${step === item.number ? 'font-medium text-white'
                                            : item.number < step
                                                ? 'text-mainYellow'
                                                : 'text-gray-400'}`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar (only on desktop) */}
                        <div className="mt-6 px-2 hidden lg:block">
                            <div className="w-full bg-accentGray rounded-full h-2">
                                <div
                                    className="bg-mainRed h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Step {step} of {steps.length}</p>
                        </div>
                    </div>

                    {/* Main Step Content */}
                    <div className="w-full lg:w-3/4 bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-accentGray">
                        <div className="min-h-[400px]">
                            <RenderEventSteps />
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