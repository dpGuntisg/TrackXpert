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
    const { t } = useTranslation();
    
    return(
        <div className='p-5 sm:p-10 min-h-screen'>

            <div className='flex items-center justify-center'>
                <h1 className='text-2xl font-bold'>{t('event.createEvent')}</h1>
            </div>

            <div className='flex flex-row w-full p-5 sm:p-10'>
                <div className='flex flex-col items-center justify-center w-1/4 '>
                    <p>Details</p>
                    <p>Something</p>
                    <p>Balls</p>
                </div>
                <div className='w-1/2'>
                    <EventDetailsStep
                     values={values}
                     setValues={setValues}
                     errors={errors}
                     touched={touched}
                     />
                </div>
            </div>

        </div>
    )
}

export default CreateEventPage;