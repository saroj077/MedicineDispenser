const mongoose = require("mongoose");

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: "User" 
  },
  name: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: Boolean, default: false }
}, { collection: 'medicines' }); // Explicit collection name

// Check if model is already defined to avoid overwriting
const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

module.exports = Medicine;
