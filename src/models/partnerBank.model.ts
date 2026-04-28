import mongoose,{Document} from "mongoose"

interface IpartnerBank extends Document {
    owner:mongoose.Types.ObjectId,
    bankName:string,
    accountNumber:string,
    ifscCode:string,
    accountHolderName:string,
    upiId?:string,
    status:"not_added"|"added"|"verified",
    createdAt:Date,
    updatedAt:Date
}

const partnerBankSchema = new mongoose.Schema<IpartnerBank>({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    bankName: {
        type:String,
        required:true,
        
    },
    accountNumber: {
        type:String,
        required:true
    },
    ifscCode: {
        type:String,
        required:true,
        uppercase:true
    },
    accountHolderName: {
        type:String,
        required:true,
        uppercase:true
    },
    upiId: {
        type:String
    },
    status: {
        type:String,
        enum:["not_added","added","verified"],
        default:"not_added"
    }
},{
    timestamps:true
})

const PartnerBank = mongoose.models.PartnerBank || mongoose.model("PartnerBank", partnerBankSchema)
export default PartnerBank