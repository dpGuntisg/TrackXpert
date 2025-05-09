import mongoose from "mongoose";

export const verifyAdmin = async (req, res, next) => {
    const id = req.userId; 
    const user = await mongoose.model("User").findById(id);
    
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
    
    next();
};

export default verifyAdmin;