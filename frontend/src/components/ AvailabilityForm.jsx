import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClock } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export const AvailabilityForm = ({ availability, setAvailability, error, setError }) => {
    const { t } = useTranslation();

    // English day names for backend
    const ENGLISH_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Function to format time in 12-hour format
    const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(":");
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        return `${hourNum % 12 || 12}:${minute} ${ampm}`;
    };

    const [newAvailability, setNewAvailability] = useState({
        startDay: "Monday",
        endDay: "Monday",
        open_time: '09:00',
        close_time: '17:00'
    });

    // Gets all days in a range, handling week wraparounds.    
    const getDaysInRange = (startDay, endDay) => {
        const startIndex = ENGLISH_DAYS.indexOf(startDay);
        const endIndex = ENGLISH_DAYS.indexOf(endDay);
        return endIndex >= startIndex
            ? ENGLISH_DAYS.slice(startIndex, endIndex + 1)
            : [...ENGLISH_DAYS.slice(startIndex), ...ENGLISH_DAYS.slice(0, endIndex + 1)];
    };

    //Checks if two time slots overlap.
    const doTimesOverlap = (start1, end1, start2, end2) => start1 < end2 && start2 < end1;

    //Checks if new availability overlaps with existing slots.
    const hasOverlap = (newSlot) => {
        const newRangeDays = getDaysInRange(newSlot.startDay, newSlot.endDay);
        return availability.some(existingSlot => 
            getDaysInRange(existingSlot.startDay, existingSlot.endDay).some(day => 
                newRangeDays.includes(day)
            ) && doTimesOverlap(newSlot.open_time, newSlot.close_time, existingSlot.open_time, existingSlot.close_time)
        );
    };

    //Sorts availability slots first by day, then by open time, then by close time.
    const sortAvailability = (slots) => {
        return [...slots].sort((a, b) => {
            const dayDiff = ENGLISH_DAYS.indexOf(a.startDay) - ENGLISH_DAYS.indexOf(b.startDay);
            if (dayDiff !== 0) return dayDiff;
            const timeDiff = a.open_time.localeCompare(b.open_time);
            return timeDiff !== 0 ? timeDiff : a.close_time.localeCompare(b.close_time);
        });
    };

    const addAvailability = () => {
        if (newAvailability.open_time >= newAvailability.close_time) {
            setError(t('availability.errors.openTimeBefore'));
            return;
        }

        if (hasOverlap(newAvailability)) {
            setError(t('availability.errors.overlap'));
            return;
        }

        setAvailability(sortAvailability([...availability, { ...newAvailability }]));
        setError("");
    };

    const removeAvailability = (index) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAvailability(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xl font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} />
                {t('availability.title')}
            </h4>

            {availability.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">{t('availability.selectedTimeSlots')}:</p>
                    {availability.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                            <span className="text-sm">
                                {slot.startDay === slot.endDay 
                                    ? t(`availability.days.${slot.startDay}`)
                                    : `${t(`availability.days.${slot.startDay}`)} - ${t(`availability.days.${slot.endDay}`)}`}: {formatTime(slot.open_time)} - {formatTime(slot.close_time)}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeAvailability(index)}
                                className="text-red-400 hover:text-red-500 text-sm"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">{t('availability.startDay')}</label>
                        <select
                            name="startDay"
                            value={newAvailability.startDay}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        >
                            {ENGLISH_DAYS.map(day => (
                                <option key={day} value={day}>{t(`availability.days.${day}`)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">{t('availability.endDay')}</label>
                        <select
                            name="endDay"
                            value={newAvailability.endDay}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        >
                            {ENGLISH_DAYS.map(day => (
                                <option key={day} value={day}>{t(`availability.days.${day}`)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">{t('availability.openTime')}</label>
                        <input
                            type="time"
                            name="open_time"
                            value={newAvailability.open_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">{t('availability.closeTime')}</label>
                        <input
                            type="time"
                            name="close_time"
                            value={newAvailability.close_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={addAvailability}
                    className="bg-mainYellow hover:bg-yellow-200 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {t('availability.addOpeningTimes')}
                </button>
            </div>
        </div>
    );
};

export default AvailabilityForm;
