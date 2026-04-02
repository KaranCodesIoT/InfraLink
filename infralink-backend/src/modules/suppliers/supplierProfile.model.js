import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., kg, ton, piece
  moq: { type: Number, required: true }, // Minimum Order Quantity
  availableStock: { type: Number, default: 0 },
  deliveryTimeDays: { type: Number, required: true },
  images: [{ type: String }] // Cloudinary URLs
});

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String },
  images: [{ type: String }]
});

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const supplierProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // 1. Basic Details
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    logo: { type: String }, // Cloud URL

    // 2. Location & Service Area
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      serviceAreas: [{ type: String }],
    },

    // 3. Supplier Category
    categories: [{
      type: String,
      enum: [
        'Cement Supplier',
        'Steel Supplier',
        'Sand / Aggregates',
        'Bricks / Blocks',
        'Tiles & Flooring',
        'Electrical Materials',
        'Plumbing Materials',
        'Furniture Supplier'
      ],
      required: true
    }],

    // 4. Product Details
    products: [productSchema],

    // 5. Delivery & Logistics
    logistics: {
      deliveryAvailable: { type: Boolean, default: false },
      deliveryCharges: { type: Number, default: 0 },
      transportType: { type: String, enum: ['Own Transport', 'Third-party'] },
      sameDayDelivery: { type: Boolean, default: false }
    },

    // 6. Pricing & Payment
    paymentDetails: {
      paymentMethods: [{
        type: String,
        enum: ['Cash', 'UPI', 'Bank Transfer', 'Online']
      }],
      advanceRequiredPercentage: { type: Number, default: 0, min: 0, max: 100 }
    },

    // 7. Trust & Verification
    verification: {
      gstNumber: { type: String, uppercase: true },
      businessLicense: { type: String }, // Document URL or Number
      yearsOfExperience: { type: Number, default: 0 },
      verifiedBadge: { type: Boolean, default: false } // Admin assigned
    },

    // 8. Ratings & Reviews
    ratings: [ratingSchema],
    reputation: {
      averageRating: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      repeatClients: { type: Number, default: 0 }
    },

    // 9. Smart AI Fields (Internal)
    aiMetrics: {
      reliabilityScore: { type: Number, default: 50, min: 0, max: 100 }, // AI auto-updated based on delivery/quality
      deliverySuccessRate: { type: Number, default: 50, min: 0, max: 100 }, // % of on-time deliveries
      avgResponseTimeHours: { type: Number, default: 24 } // Time to accept/reject
    },

    // 10. Portfolio / Past Work
    portfolio: [portfolioSchema],

    // System States
    isProfileActive: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

supplierProfileSchema.virtual('totalReviews').get(function() {
  return this.ratings ? this.ratings.length : 0;
});

// Calculate average rating before saving
supplierProfileSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.value, 0);
    this.reputation.averageRating = sum / this.ratings.length;
  } else {
    this.reputation.averageRating = 0;
  }
  next();
});

supplierProfileSchema.index({ 'location.city': 1 });
supplierProfileSchema.index({ categories: 1 });
supplierProfileSchema.index({ 'aiMetrics.reliabilityScore': -1 });

const SupplierProfile = mongoose.model('SupplierProfile', supplierProfileSchema);
export default SupplierProfile;
