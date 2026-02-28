import mongoose from "mongoose";

const collaborationRequestSchema = new mongoose.Schema({
    investorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    entrepreneurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    createdAt: {
        type: String,
        required: true,
    },
},{
    timestamps: false,
    // toJSON and toObject options to include virtuals and remove __v and _id
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
            return ret;
        }
    }
});

// The Virtual ID field allows us to return 'id' instead of '_id' in the JSON response
collaborationRequestSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

const CollaborationRequest = mongoose.model("CollaborationRequest", collaborationRequestSchema);

export default CollaborationRequest;