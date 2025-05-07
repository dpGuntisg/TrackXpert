import User from "../models/User";

class AdminService {

    
    static async getAllUsers() {
        try{
            return await User.find().select("-password");
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }
}