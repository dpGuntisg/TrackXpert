import React, { useState } from "react";
import Calendar from "../Calendar";

export const EventScheduleStep = () => {

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleDateRangeChange = (dates) => {
        setStartDate(dates[0]);
        setEndDate(dates[1]);
    };

    return(
        <div>
            <h2>Event Schedule</h2>
            <div className="">
            <Calendar
                isRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
            />
            </div>
        </div>
    )
};