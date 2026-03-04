import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
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
   amount: {
    type: String,
    required: true,
   },
   equity: {
    type: String,
    required: true,
   },
   status: {
    type: String,
    enum: ["Due Diligence", "Term Sheet", "Negotiation", "Closed", "Passed"],
    default: "Due Diligence",
   },
    stage: {
    type: String,
    required: true,
    },
    notes: {
    type: String,
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString(),
    },
    lastActivity: {
        type: String,
        default: () => new Date().toISOString(),
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
dealSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

// Index for fetching deals for a specific investor
dealSchema.index({ investorId: 1, lastActivity: -1 });

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;