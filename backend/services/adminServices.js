import User from "../models/User.js";
import Track from "../models/Track.js";
import UserActionLog from "../models/UserActionLog.js";
import mongoose from "mongoose";

class AdminService {
    static async getAllUsers() {
        try{
            return await User.find().select("-password");
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    static async getLogs({page = 1, limit = 10, action, userId, startDate, endDate, sortOrder}) {
        try {
            const skip = (page - 1) * limit;
            const logQuery = {};

            if(action) logQuery.action = action; 
            if(userId) logQuery.userId = userId; 
            if (startDate || endDate) {
                logQuery.createdAt = {};
                if (startDate) logQuery.createdAt.$gte = new Date(startDate);
                if (endDate)   logQuery.createdAt.$lte = new Date(endDate);
            }
            if (sortOrder !== "asc" && sortOrder !== "desc") {sortOrder = "desc";}
            const sortDir = sortOrder === "asc" ? 1 : -1;

            const logs = await UserActionLog
                .find(logQuery)
                .sort({createdAt: sortDir})
                .skip(skip)
                .populate("userId", "username email")
                .limit(limit)

            const total = await UserActionLog.countDocuments(logQuery);

            return {
                logs,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                sortDir
              };

        } catch (error) {
            console.error("Error in getLogs:", error);
            throw new Error("Unable to fetch logs right now");
        }
    }

    //Statistics
    static async getTracksPerCountry() {
        try {
            const result = await Track.aggregate([
                {
                  $project: {
                    country: {
                      $trim: {
                        input: { $arrayElemAt: [{ $split: ["$location", ","] }, 0] }
                      }
                    }
                  }
                },
                {
                  $group: {
                    _id: "$country",
                    count: { $sum: 1 }
                  }
                },
                {
                  $sort: { count: -1 }
                },
                {
                  $project: {
                    country: "$_id",
                    count: 1,
                    _id: 0
                  }
                }
            ]);
            return result;
        } catch (error) {
            console.error("Error in getTracksPerCountry:", error);
            throw new Error("Failed to get track statistics");
        }
    }
}

export default AdminService;