import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './Calendar.css';

const Calendar = ({ isRange = false, startDate, endDate, onChange, onClose }) => {
    const { t } = useTranslation();

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="calendar-container relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-mainYellow hover:text-white"
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                
                <div className="text-mainYellow text-center mb-4">
                    {startDate && endDate ? (
                        `${formatDate(startDate)} to ${formatDate(endDate)}`
                    ) : (
                        t('event.form.selectDates')
                    )}
                </div>

                <DatePicker
                    selectsRange={isRange}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={onChange}
                    inline
                    monthsShown={1}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="custom-datepicker"
                    calendarClassName="custom-calendar"
                    dayClassName={(date) => {
                        const day = date.getDay();
                        return day === 0 || day === 6 ? 'weekend' : '';
                    }}
                    highlightDates={[]}
                    renderCustomHeader={({
                        date,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                    }) => (
                        <div className="custom-header">
                            <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                className="nav-button"
                            >
                                ←
                            </button>
                            <span className="month-year">
                                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                className="nav-button"
                            >
                                →
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default Calendar; 