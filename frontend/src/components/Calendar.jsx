import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import './Calendar.css';

const Calendar = ({ isRange = false, startDate, endDate, onChange }) => {
    const { t } = useTranslation();
    const [dateRange, setDateRange] = useState([startDate, endDate]);
    const [startDateValue, endDateValue] = dateRange;

    const handleDateChange = (dates) => {
        setDateRange(dates);
        onChange(dates);
    };

    return (
        <div className="calendar-container">
            <DatePicker
                selectsRange={isRange}
                startDate={startDateValue}
                endDate={endDateValue}
                onChange={handleDateChange}
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
    );
};

export default Calendar; 