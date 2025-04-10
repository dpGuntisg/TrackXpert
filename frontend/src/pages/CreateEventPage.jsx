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

    const handleStepNavigation = (direction) => {
        if (direction === 'next') {
            setStep(prev => Math.min(prev + 1, 2));
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
            default:
                return null;
        }
    };
    
    return(
        <div className='p-5 sm:p-10 min-h-screen'>

            <div className='flex items-center justify-center'>
                <h1 className='text-2xl font-bold'>{t('event.createEvent')}</h1>
            </div>

            <div className='flex flex-row w-full p-5 sm:p-10'>
                <div className='flex flex-col items-center justify-center w-1/4 '>
                    <p className={step === 1 ? 'py-2 px-5 font-bold text-2xl  border border-transparent bg-accentBlue' : 'text-gray-500'}>1. Details</p>
                    <p>Something</p>
                    <p>Balls</p>
                </div>
                <div className='w-1/2'>
                    <RenderEventSteps />
                    <div>
                        <button onClick={() => handleStepNavigation('prev')}> bak</button>
                        <button onClick={() => handleStepNavigation('next')}> neks</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CreateEventPage;