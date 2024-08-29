import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required:true
  },
  status: String,
  responseTime: Number,
  lastChecked: Date,
});

const Website = mongoose.model("Website", websiteSchema);
export default Website;
