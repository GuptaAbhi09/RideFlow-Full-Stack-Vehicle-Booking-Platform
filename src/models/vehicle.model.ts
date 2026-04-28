import mongoose,{Document} from "mongoose"

const vehicleType = ["Bike","Car","SUV","Loader","Bus","Auto","Truck"] as const
const vehicleStatus = ["approved","pending","rejected"] as const

interface Ivehicle extends Document {
    owner: mongoose.Types.ObjectId,
    vehicleType:typeof vehicleType[number],
    vehicleModel:string,
    plateNumber:string,
    imageUrl:string,
    baseFare:number,
    pricePerKm:number,
    waitingCharge:number,
    status:"approved"|"pending"|"rejected",
    rejectionReason:string,
    isActive:boolean,
    createdAt:Date,
    updatedAt:Date
}

const vehicleSchema = new mongoose.Schema<Ivehicle>({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    vehicleType: {
        type:String,
        enum:vehicleType,
        required:true
    },
    vehicleModel: {
        type:String,
        required:true
    },
    plateNumber: {
        type:String,
        required:true
    },
    imageUrl: {
        type:String,
        required:true
    },
    baseFare: {
        type:Number,
        required:true
    },
    pricePerKm: {
        type:Number,
        required:true
    },
    waitingCharge: {
        type:Number,
        required:true
    },
    status: {
        type:String,
        enum:vehicleStatus,
        default:"pending"
    },
    rejectionReason: {
        type:String
    },
    isActive: {
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema)
export default Vehicle