import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faQuestionCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Calendar from '../Calendar';
import CustomCheckbox from '../CustomCheckbox';

export const EventRegistrationStep = ({
    values,
    setValues,
    errors
}) => {
    const { t } = useTranslation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [participantsInput, setParticipantsInput] = useState(values.participants || '');

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
        // Ensure we have a Date object
        const dateObj = date instanceof Date ? date : new Date(date);
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) return "";
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleParticipantsChange = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^[0-9]+$/.test(value)) {
            setParticipantsInput(value);
            setValues(prev => ({
                ...prev,
                participants: value ? parseInt(value, 10) : ''
            }));
        }
    };

    const handleUnlimitedParticipantsChange = () => {
        const newValue = !values.unlimitedParticipants;
        setValues(prev => ({
            ...prev, 
            unlimitedParticipants: newValue,
            // Clear participants count if unlimited is checked
            participants: newValue ? '' : prev.participants
        }));
        
        if (newValue) {
            setParticipantsInput('');
        }
    };

    const tooltips = {
        manualApproval: t('event.tips.manualApproval', 'You will need to manually approve each participant before they can attend the event.'),
        pdfTickets: t('event.tips.pdfTickets', 'The system will generate PDF tickets that participants can download and print or show on their device.')
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
                        value={participantsInput}
                        onChange={handleParticipantsChange}
                        disabled={values.unlimitedParticipants}
                        className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                        ${errors.participants ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}
                        ${values.unlimitedParticipants ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <CustomCheckbox 
                        label={t('event.unlimitedParticipants')}
                        checked={values.unlimitedParticipants || false}
                        onChange={handleUnlimitedParticipantsChange}
                        className="w-2/5"
                    />
                </div>
                {errors.participants && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.participants}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    {t('event.regDates')}
                </label>
                <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className={`flex items-center justify-center w-full py-3 px-4 bg-gray-800 rounded-lg cursor-pointer transition-colors
                        ${errors.registrationDate ? 'border-red-500 hover:border-red-500' : 'border-gray-700 hover:border-mainRed'} border`}            
                >
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    {values.registrationDate?.startDate && values.registrationDate?.endDate ? (
                        `${formatDate(values.registrationDate.startDate)} to ${formatDate(values.registrationDate.endDate)}`
                    ) : (
                        t('event.selectRegDates')
                    )}
                </button>
                {errors.registrationDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.registrationDate}
                    </p>
                )}
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
                <label className="block text-sm font-medium text-gray-300">{t('event.regInstructions')}</label>
                <textarea
                    placeholder={t('event.regInstructionsPlaceholder')}
                    value={values.registrationInstructions || ''}
                    onChange={(e) => setValues(prev => ({ ...prev, registrationInstructions: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                    ${errors.registrationInstructions ? 'border-red-500 focus:border-red-500' : 
                    values.requireManualApproval && (!values.registrationInstructions || values.registrationInstructions.trim().length < 10) 
                    ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
                    rows={4}
                />
                {(errors.registrationInstructions || (values.requireManualApproval && (!values.registrationInstructions || values.registrationInstructions.trim().length < 10))) && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.registrationInstructions || t('event.instructionsRequired') || 'Detailed registration instructions (at least 10 characters) are required for events with manual approval'}
                    </p>
                )}
                <div className='flex flex-col items-start space-y-3 mt-2'>
                    <div className="flex items-center relative">
                        <CustomCheckbox 
                            label={t('event.requireManualApproval')}
                            checked={values.requireManualApproval || false}
                            onChange={() => setValues(prev => ({...prev, requireManualApproval: !prev.requireManualApproval}))}
                        />
                        <div 
                            className="ml-2 text-gray-400 cursor-help"
                            onMouseEnter={() => setActiveTooltip('manualApproval')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            {activeTooltip === 'manualApproval' && (
                                <div className="absolute left-full ml-2 top-0 bg-gray-900 text-gray-200 p-3 rounded-md shadow-lg w-64 text-sm z-10">
                                    {tooltips.manualApproval}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center relative">
                        <CustomCheckbox 
                            label={t('event.generatePDF')}
                            checked={values.generatePdfTickets || false}
                            onChange={() => setValues(prev => ({...prev, generatePdfTickets: !prev.generatePdfTickets}))}
                        />
                        <div 
                            className="ml-2 text-gray-400 cursor-help"
                            onMouseEnter={() => setActiveTooltip('pdfTickets')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            {activeTooltip === 'pdfTickets' && (
                                <div className="absolute left-full ml-2 top-0 bg-gray-900 text-gray-200 p-3 rounded-md shadow-lg w-64 text-sm z-10">
                                    {tooltips.pdfTickets}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};