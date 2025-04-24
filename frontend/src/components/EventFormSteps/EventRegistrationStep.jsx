import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar,} from '@fortawesome/free-solid-svg-icons';
import Calendar from '../Calendar';
import CustomCheckbox from '../CustomCheckbox';

export const EventRegistrationStep = ({
    values,
    setValues,
    errors
}) => {
    const { t } = useTranslation();
    const [showCalendar, setShowCalendar] = useState(false);

    const handleDateRangeChange = (dates) => {
        setValues(prev => ({
            ...prev,
            registrationDate: {
                startDate: dates[0],
                endDate: dates[1]
            }
        }));
    };
    
    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    return (
        <div className='flex flex-col space-y-4'>
            <h3 className="text-lg font-semibold mb-4">{t('event.registration')}</h3>
            <div className='flex flex-col w-4/5'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>{t('event.participants')}</label>
                <div className='flex flex-row gap-4 items-center'>
                    <input 
                        placeholder='0'
                        type="text"
                        inputMode='numeric'
                        className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                        ${errors.participants ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
                    />
                    <CustomCheckbox 
                        label={t('event.unlimitedParticipants')}
                        checked={values.unlimitedParticipants || false}
                        onChange={() => setValues(prev => ({...prev, unlimitedParticipants: !prev.unlimitedParticipants}))}
                        className="w-2/5"
                    />
                </div>
                {errors.participants && <p className="text-red-500 text-sm mt-1">{errors.participants}</p>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    {t('event.form.selectRegistrationDates')}
                </label>
                <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className={`flex items-center justify-center w-full py-3 px-4 bg-gray-800 rounded-lg cursor-pointer transition-colors
                        ${errors.images ? 'border-red-500 hover:border-red-500' : 'border-gray-700 hover:border-mainRed'} border`}            
                >
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    {values.registrationDate?.startDate && values.registrationDate?.endDate ? (
                        `${formatDate(values.registrationDate.startDate)} to ${formatDate(values.registrationDate.endDate)}`
                    ) : (
                        t('event.form.selectRegistrationDates')
                    )}
                </button>
            </div>
            {showCalendar && (
                <Calendar
                    isRange={true}
                    startDate={values.registrationDate?.startDate}
                    endDate={values.registrationDate?.endDate}
                    onChange={handleDateRangeChange}
                    onClose={() => setShowCalendar(false)}
                />
            )}
            <div className='flex flex-col space-y-2'>
                <label className="block text-sm font-medium text-gray-300">{t('event.registrationInstructions')}</label>
                <textarea
                    placeholder={t('event.registrationInstructions')}
                    value={values.registrationInstructions}
                    onChange={(e) => setValues({ ...values, registrationInstructions: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                    ${errors.registrationInstructions ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
                />
                <div className='flex flex-col items-start space-y-3 mt-2'>
                    <CustomCheckbox 
                        label={t('event.requireManualApproval')}
                        checked={values.requireManualApproval || false}
                        onChange={() => setValues(prev => ({...prev, requireManualApproval: !prev.requireManualApproval}))}
                    />
                    <CustomCheckbox 
                        label={t('event.generatePdfTickets')}
                        checked={values.generatePdfTickets || false}
                        onChange={() => setValues(prev => ({...prev, generatePdfTickets: !prev.generatePdfTickets}))}
                    />
                </div>
            </div>
        </div>
    );
}