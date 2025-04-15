import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import TrackCard from "../TrackCard";

export const EventTrackSelectionStep = ({
    userId,
    selectedTracks,
    onSelectionChange,
    error
}) => {

    useEffect(() => {
        const fetchUserTracks = async () => {
            try{
                const res = await axiosInstance.get()
            }
        }
    });

    return(
        <div>
            EventTrackSelectionStep
        </div>
    )
};

export default EventTrackSelectionStep;