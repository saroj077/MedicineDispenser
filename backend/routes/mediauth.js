const express = require('express');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

const router = express.Router();

// 1) CREATE Medicine
router.post('/medicines', async (req, res) => {
  const { userId, name, time } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const newMedicine = new Medicine({
      userId: new mongoose.Types.ObjectId(userId),
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

// 2) READ Medicines by user
router.get('/medicines/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const medicines = await Medicine.find({ userId });
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3) DELETE Medicine
router.delete('/medicines/:userId/:medicineId', async (req, res) => {
  try {
    const { userId, medicineId } = req.params;

    console.log("DELETE Request Received:", {
      userId,
      medicineId,
      validUserId: mongoose.Types.ObjectId.isValid(userId),
      validMedicineId: mongoose.Types.ObjectId.isValid(medicineId)
    });

    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Use new ObjectId conversion for both fields
    const result = await Medicine.deleteOne({
      _id: new mongoose.Types.ObjectId(medicineId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    console.log("MongoDB Delete Result:", result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("Full Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
