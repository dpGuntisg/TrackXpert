import mongoose from "mongoose";

const TrackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    availability: [
        {
            startDay: { 
                type: String, 
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], 
                required: false 
            },
            endDay: { 
                type: String, 
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], 
                required: false 
            },
            open_time: { type: String, required: false }, 
            close_time: { type: String, required: false }
        }
    ],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coordinates: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    }
});

// Pre-save middleware for validation
TrackSchema.pre("save", function (next) {
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Only validate availability if it's provided
    if (this.availability && this.availability.length > 0) {
        this.availability.forEach((slot) => {
            const startIdx = daysOrder.indexOf(slot.startDay);
            const endIdx = daysOrder.indexOf(slot.endDay);

            // Check if startDay and endDay are valid
            if (startIdx === -1) {
                return next(new Error("Invalid start day."));
            }
            if (endIdx === -1) {
                return next(new Error("Invalid end day."));
            }

            console.log(`startIdx: ${startIdx}, endIdx: ${endIdx}`);

            // Check if endDay is after or the same as startDay
            if (startIdx > endIdx) {
                return next(new Error("End day must be on or after the start day."));
            }

            // Handle case where startDay and endDay are the same
            if (startIdx === endIdx) {
                slot.endDay = slot.startDay; // Ensure endDay equals startDay
            }

            // Time validation if both open and close times are provided
            if (slot.open_time && slot.close_time) {
                const openTimeParts = slot.open_time.split(":").map(Number);
                const closeTimeParts = slot.close_time.split(":").map(Number);

                if (openTimeParts.length !== 2 || closeTimeParts.length !== 2) {
                    return next(new Error("Invalid time format. Expected HH:MM."));
                }

                const openMinutes = openTimeParts[0] * 60 + openTimeParts[1];
                const closeMinutes = closeTimeParts[0] * 60 + closeTimeParts[1];

                if (openMinutes >= closeMinutes) {
                    return next(new Error("Close time must be after open time."));
                }
            } else if (slot.open_time || slot.close_time) {
                return next(new Error("Both open time and close time must be provided if one is specified."));
            }
        });
    }

    next();
});


// Create a geospatial index for coordinates
TrackSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("Track", TrackSchema);
