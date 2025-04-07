import React from 'react';
import { EventDetailsStep } from '../components/EventFormSteps/EventDetailsStep';
import { useTranslation } from 'react-i18next';

function CreateEventPage() {
    const { t } = useTranslation();
    return(
        <div className='p-5 sm:p-10 min-h-screen'>

            <div className='flex items-center justify-center'>
                <h1 className='text-2xl font-bold'>{t('event.createEvent')}</h1>
            </div>

            <div className='flex flex-row w-full p-5 sm:p-10'>
                <div className='flex items-center justify-center w-1/4 '>
                    viens divi tris
                </div>
                <div className='w-1/2'>
                    <EventDetailsStep />
                </div>
            </div>

        </div>
    )
}

export default CreateEventPage;