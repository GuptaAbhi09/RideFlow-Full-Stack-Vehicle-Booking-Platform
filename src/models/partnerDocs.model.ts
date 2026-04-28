import mongoose, { Document } from "mongoose";

interface IpartnerDocs extends Document {
    owner:mongoose.Types.ObjectId,
    aadharUrl:string,
    licenseUrl:string,
    rcUrl:string,
    status:"pending"|"approved"|"rejected",
    rejectionReason:string,
    profilePicUrl:string,
    createdAt:Date,
    updatedAt:Date
}

const partnerDocsSchema = new mongoose.Schema<IpartnerDocs>({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    aadharUrl: {
        type:String,
        required:true
    },
    licenseUrl: {
        type:String,
        required:true
    },
    rcUrl: {
        type:String,
        required:true
    },
    status: {
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    rejectionReason: {
        type:String
    },
    profilePicUrl: {
        type:String,
        required:true
    }
},{
    timestamps:true
})

const PartnerDocs = mongoose.models.PartnerDocs || mongoose.model("PartnerDocs", partnerDocsSchema)
export default PartnerDocs