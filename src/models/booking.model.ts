import mongoose, { Document, Schema } from "mongoose"

export const bookingStatusEnum = ["searching", "accepted", "arriving", "started", "completed", "cancelled"] as const
export const vehicleTypeEnum = ["Bike", "Car", "Auto", "SUV", "Loader", "Bus", "Truck"] as const

export interface IBooking extends Document {
  customerId: mongoose.Types.ObjectId
  driverId?: mongoose.Types.ObjectId
  pickup: string
  pickupLat?: number
  pickupLng?: number
  drop: string
  dropLat?: number
  dropLng?: number
  mobileNumber: string
  startOtp?: string
  vehicleType: typeof vehicleTypeEnum[number]
  status: typeof bookingStatusEnum[number]
  fare?: number
  distance?: string
  duration?: string
  paymentStatus?: 'pending' | 'completed'
  paymentId?: string
  rating?: number
  review?: string
  chatMessages: {
    sender: 'customer' | 'partner'
    text: string
    timestamp: Date
  }[]
  trackingToken?: string
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  pickup: {
    type: String,
    required: true
  },
  pickupLat: {
    type: Number
  },
  pickupLng: {
    type: Number
  },
  drop: {
    type: String,
    required: true
  },
  dropLat: {
    type: Number
  },
  dropLng: {
    type: Number
  },
  mobileNumber: {
    type: String,
    required: true
  },
  startOtp: {
    type: String
  },
  vehicleType: {
    type: String,
    enum: vehicleTypeEnum,
    required: true
  },
  status: {
    type: String,
    enum: bookingStatusEnum,
    default: "searching"
  },
  fare: {
    type: Number
  },
  distance: {
    type: String
  },
  duration: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  },
  chatMessages: [{
    sender: { type: String, enum: ['customer', 'partner'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  trackingToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
})

const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema)
export default Booking
