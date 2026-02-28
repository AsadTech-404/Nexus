import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatarUrl: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    bio: {
        type: String,
        default: "",
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["entrepreneur", "investor"],
        default: "entrepreneur",
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString(),
    },
},{
    timestamps: false,
    // discriminatorKey is required for Mongoose to know which field to use when determining the model type in a discriminator setup
    discriminatorKey: "role",
    // toJSON and toObject options to include virtuals and remove __v and _id
    toJSON: { 
        virtuals: true,
        versionKey: false, 
        transform: function (doc, ret) {
            delete ret._id; 
            return ret;
        } 
    },
    toObject: { 
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
            return ret;
        } 
    },
});

// The Virtual ID field allows us to return 'id' instead of '_id' in the JSON response
userSchema.virtual("id").get(function() {
    return this._id.toHexString();
});


const User = mongoose.model("User", userSchema);

// Entrepreneur Schema
const Entrepreneur = User.discriminator("entrepreneur", new mongoose.Schema({
  startupName: {
    type: String
  }, 
  pitchSummary:{
    type: String
  },
  fundingNeeded:{
    type: String
  }, 
  industry: {
    type: String
  }, 
  location:{
    type: String
  }, 
  foundedYear:{
    type: Number
  }, 
  teamSize:{
    type: Number
  }
}));

// Investor Schema
const Investor = User.discriminator("investor", new mongoose.Schema({
    investmentInterests: [
        { type: String }
    ],
    investmentStage: [
        { type: String }
    ],
    portfolioCompanies: [
        { type: String }
    ],
    totalInvestments: { type: Number },
    minimumInvestment: { type: String },
    maximumInvestment: { type: String },
    walletBalance: { type: Number, default: 0 },
})); 

export { User, Entrepreneur, Investor };