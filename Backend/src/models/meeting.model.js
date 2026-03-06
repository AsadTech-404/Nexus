import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
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
    scheduledTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    location: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString(),
    }
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
})

// The Virtual ID field allows us to return 'id' instead of '_id' in the JSON response
meetingSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

// Index for conflict detection queries for a specific investor or entrepreneur
meetingSchema.index({ investorId: 1, entrepreneurId: 1, scheduledTime: 1, endTime: 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;