import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClock } from '@fortawesome/free-solid-svg-icons';

export const AvailabilityForm = ({ availability, setAvailability, error, setError }) => {
    const [newAvailability, setNewAvailability] = useState({
        startDay: 'Monday',
        endDay: 'Monday',
        open_time: '09:00',
        close_time: '17:00'
    });

    const addAvailability = () => {
        if (newAvailability.open_time < newAvailability.close_time) {
            if (newAvailability.startDay === newAvailability.endDay || isDayAfter(newAvailability.startDay, newAvailability.endDay)) {
                setAvailability([...availability, {
                    startDay: newAvailability.startDay,
                    endDay: newAvailability.endDay,
                    open_time: newAvailability.open_time,
                    close_time: newAvailability.close_time
                }]);
                setNewAvailability({
                    startDay: 'Monday',
                    endDay: 'Monday',
                    open_time: '09:00',
                    close_time: '17:00'
                });
                setError('');
            } else {
                setError("End day must be on or after the start day.");
            }
        } else {
            setError("Open time must be earlier than close time.");
        }
    };

    const removeAvailability = (index) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const isDayAfter = (day1, day2) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return days.indexOf(day1) <= days.indexOf(day2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAvailability(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xl font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} />
                Set Opening Hours

            </h4>

            {availability.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Selected Time Slots:</p>
                    {availability.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                            <span className="text-sm">
                                {slot.startDay} to {slot.endDay}: {slot.open_time} - {slot.close_time}
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
                        <label className="block text-sm font-medium text-gray-300">Start Day</label>
                        <select
                            name="startDay"
                            value={newAvailability.startDay}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        >
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">End Day</label>
                        <select
                            name="endDay"
                            value={newAvailability.endDay}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        >
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Open Time</label>
                        <input
                            type="time"
                            name="open_time"
                            value={newAvailability.open_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Close Time</label>
                        <input
                            type="time"
                            name="close_time"
                            value={newAvailability.close_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white focus:ring-2 focus:ring-mainRed outline-none"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="button"
                    onClick={addAvailability}
                    className="bg-mainYellow hover:bg-yellow-200 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Add Opening Times
                </button>
            </div>
        </div>
    );
};

export default AvailabilityForm;