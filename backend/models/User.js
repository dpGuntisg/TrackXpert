import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  name: { type: String},
  surname: { type: String},
  phonenumber: { type: String, sparse: true, unique: true,},
  profile_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image'},
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
  password: { type: String, required: true, match: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/ },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedUntil: { type: Date }
},{ timestamps: true });

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);