import User from "../models/User.js";
import Track from "../models/Track.js";
import Event from "../models/Event.js";
import Token from "../models/Token.js";
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

    static async getLogs({page = 1, limit = 10, action, userId, startDate, endDate, sortOrder, search}) {
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
            if (search && search.trim()) {
                const searchTerm = search.trim();
                try {
                    const searchObjectId = new mongoose.Types.ObjectId(searchTerm);
                    logQuery.userId = searchObjectId;
                } catch {
                    const users = await User.find({
                        $or: [
                            { username: { $regex: searchTerm, $options: 'i' } },
                            { email: { $regex: searchTerm, $options: 'i' } }
                        ]
                    }).select('_id');
                    
                    if (users.length > 0) {
                        logQuery.userId = { $in: users.map(user => user._id) };
                    } else {
                        return {
                            logs: [],
                            totalPages: 0,
                            currentPage: page,
                            sortDir: sortOrder === "asc" ? 1 : -1
                        };
                    }
                }
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
    static async  getSummaryCount() {
        const [userCount, activeUserCount, trackCount, eventCount] = await Promise.all([
            User.countDocuments(),
            Token.countDocuments(),
            Track.countDocuments(),
            Event.countDocuments()
        ]);
        return { userCount, activeUserCount, trackCount, eventCount };
    }
    static async getTracksPerCountry(limit = 10) {
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
                    $limit: limit
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
    static async getMonthlyUserGrowth() {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
        const growth = await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
              }
            }
          },
          {
            $group: {
              _id: { $dayOfMonth: "$createdAt" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
    
        const daysInMonth = endOfMonth.getDate();
        const fullMonthData = Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const entry = growth.find(g => g._id === day);
          return {
            day,
            count: entry ? entry.count : 0
          };
        });
    
        return fullMonthData;
      } catch (error) {
        console.error("Error in getMonthlyUserGrowth:", error);
        throw new Error("Failed to fetch monthly user growth");
      }
    }
    
}

export default AdminService;