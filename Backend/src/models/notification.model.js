import mongoose from 'mongoose';

const notifictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: [
            "message",
            "collaboration-request",
            "collaboration-accepted",
            "meeting-scheduled",
            "meeting-status"
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
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
notifictionSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

// Index for fetching notifications for a specific user
notifictionSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notifictionSchema);

export default Notification;