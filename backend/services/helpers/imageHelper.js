import mongoose from "mongoose";
import Image from "../../models/Images.js";

async function createImage(base64String, mimeType) {
    const image = await Image.create({
      data: base64String,  // Store the base64 image data
      mimeType: mimeType,  // Store the mime type (e.g., "image/png")
    });
    return image;  // Return the created image document
  }
  
  export { createImage };