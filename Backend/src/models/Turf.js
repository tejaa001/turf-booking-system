import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const turfSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin',
    },
    turfName: {
      type: String,
      required: [true, 'Turf name is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required.'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
      },
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required.'],
    },
    images: [imageSchema],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    operatingHours: {
      open_time: { type: String, required: true }, // e.g., '09:00'
      close_time: { type: String, required: true }, // e.g., '22:00'
    },
    contactDetails: {
      type: String,
      required: [true, 'Contact details are required.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the location field for efficient geospatial queries.
turfSchema.index({ location: '2dsphere' });

const Turf = mongoose.model('Turf', turfSchema);

export default Turf;