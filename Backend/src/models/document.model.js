import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    document: {
        type: String,
        required: true,
    },
    shared: {
        type: Boolean,
        default: false,
    },
    lastModified: {
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
documentSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

// Index for fetching documents for a specific owner
documentSchema.index({ ownerId: 1, lastModified: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;