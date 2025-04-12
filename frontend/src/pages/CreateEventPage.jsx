import React, { useState } from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { useTranslation } from 'react-i18next';

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
   
    return(
        <div className='p-5 sm:p-10 min-h-screen'>
            <div className='flex items-center justify-center'>
                <h1 className='text-2xl font-bold'>{t('event.createEvent')}</h1>
            </div>
            <div className='flex flex-col lg:flex-row w-full p-5 sm:p-10'>
                <div className='flex flex-col items-start justify-start w-1/4 rounded-lg p-4'>
                    {steps.map((item) => (
                        <div key={item.number} className={`flex items-center mb-4 py-2 w-[200px] px-4 rounded-lg ${step === item.number ? 'bg-mainRed/30' : 'text-gray-400'}`}>
                            <div 
                              className={`flex items-center justify-center w-8 h-8 rounded-full border
                              ${step === item.number ? 'bg-mainRed text-white border-mainRed' : 'bg-mainBlue text-gray-400 border-accentBlue'}`}
                            >
                                {item.number}
                            </div>
                            <span 
                                className={`ml-3 ${step === item.number 
                                    ? 'font-medium text-white' 
                                    : 'text-gray-400'}`}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className='w-3/4 pl-8'>
                    <RenderEventSteps />
                    <div className="flex space-x-4 mt-6">
                        <button 
                            onClick={() => handleStepNavigation('prev')}
                            className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={step === 1}
                        >
                            {t('tracks.back') || 'Back'}
                        </button>
                        <button 
                            onClick={() => handleStepNavigation('next')}
                            className="px-6 py-2 bg-mainRed  rounded-md hover:bg-red-800 focus:outline-none transition-colors"
                        >
                            {step === steps.length ? (t('common.finish') || 'Finish') : (t('tracks.next') || 'Next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateEventPage;