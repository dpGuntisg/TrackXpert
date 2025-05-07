import UserActionLog from "../../models/UserActionLog.js";

export const logActivity = async (userId, action, metadata) => {
    try {
        const log = new UserActionLog({
            userId,
            action,
            metadata
        });

        await log.save();
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};
