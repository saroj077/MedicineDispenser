const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Initialize app
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'DELETE'] // Explicitly allow DELETE
  }));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Error connecting to MongoDB:", err));



// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, 
  name: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: Boolean, default: false },
});

const Medicine = mongoose.model("Medicine", MedicineSchema);




// Add Medicine
app.post('/medicine', async (req, res) => {
    const { userId, name, time } = req.body;
    try {
        // Convert userId to a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId format" });
        }

        const newMedicine = new Medicine({
            userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
            name,
            time,
        });

        await newMedicine.save();
        res.status(201).json({ message: "Medicine added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User ko med display
app.get('/medicines/:userId', async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.params.userId });
        res.json(medicines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Update medication status
app.put('/api/medicines/:userId/:medicineId', async (req, res) => {
    try {
      const { userId, medicineId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(medicineId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
  
      const updatedMed = await Medicine.findOneAndUpdate(
        { _id: medicineId, userId: userId },
        { status: req.body.status },
        { new: true }
      );
  
      if (!updatedMed) {
        return res.status(404).json({ error: "Medicine not found" });
      }
  
      res.json(updatedMed);
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Midnight ma reset hunchha
cron.schedule('0 0 * * *', async () => {
    try {
        await Medicine.updateMany({}, { $set: { status: false } });
        console.log("Medicine statuses reset");
    } catch (err) {
        console.error("Error resetting medicine statuses:", err);
    }
});

const authRoutes = require('./routes/auth');
const mediRoutes = require('./routes/mediauth'); // Ensure correct path
app.use('/api', authRoutes);
app.use('/api', mediRoutes);



// server start hunchha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));