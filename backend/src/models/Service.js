const mongoose = require('mongoose');

/**
 * Service Model
 * Represents a service offered by a PROVIDER.
 * Location inherited from provider for geo-spatial discovery.
 */
const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Plumbing',
        'Electrical',
        'Cleaning',
        'Painting',
        'Carpentry',
        'Gardening',
        'Tutoring',
        'Fitness',
        'Beauty',
        'Cooking',
        'Moving',
        'Repair',
        'Other',
      ],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: ['per_hour', 'fixed', 'per_session'],
      default: 'fixed',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    // GeoJSON Point — mirrors provider's location for geo-queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    tags: [{ type: String, trim: true }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere index for geo-spatial queries
serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ category: 1, availability: 1 });
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ price: 1 });

// Virtual populate: provider details
serviceSchema.virtual('provider', {
  ref: 'User',
  localField: 'providerId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Service', serviceSchema);
