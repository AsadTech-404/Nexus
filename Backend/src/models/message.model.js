import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Makes searching for "my sent messages" instant
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Makes searching for "messages to me" instant
    },
    content: {
        type: String,
        required: true,
        trim: true, // Removes accidental leading/trailing spaces
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' as Date objects
    timestamps: true, 
    
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            // Map 'createdAt' to 'timestamp' to match your Frontend Interface
            ret.timestamp = ret.createdAt;
            delete ret._id;
            return ret;
        }
    }
});

// Compound Index: Speeds up fetching a specific conversation between two people
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// The Virtual ID field allows us to return 'id' instead of '_id' in the JSON response
messageSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;