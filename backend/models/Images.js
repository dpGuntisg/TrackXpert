import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  data: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        return /^data:image\/(jpeg|png|gif);base64,/.test(value);
      },
      message: 'Invalid Base64 string',
    },
  },
  mimeType: { 
    type: String, 
    required: true,
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now, 
  },
});

const Image = mongoose.model('Image', ImageSchema);

export default Image;
