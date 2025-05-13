import User from "../../models/User.js";


//checks if a user has permission to modify content
export const hasModificationPermission = async (userId, contentCreatorId) => {
    try {
        // If user is the creator, they have permission
        if (userId === contentCreatorId) {
            return true;
        }
        // Check if user is an admin
        const user = await User.findById(userId);
        if (!user) {
            return false;
        }
        return user.role === "admin";
    } catch (error) {
        console.error("Error checking modification permission:", error);
        return false;
    }
};


//Middleware to check if user has permission to modify content

export const checkModificationPermission = async (req, res, next, contentCreatorId) => {
    try {
        const hasPermission = await hasModificationPermission(req.user._id, contentCreatorId);
        
        if (!hasPermission) {
            return res.status(403).json({ message: "Unauthorized: You don't have permission to modify this content" });
        }
        
        next();
    } catch (error) {
        console.error("Error in permission middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 