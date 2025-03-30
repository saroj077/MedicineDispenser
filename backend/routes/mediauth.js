const express = require('express');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

const router = express.Router();

// Add Medicine
router.post('/medicine', async (req, res) => {
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
router.get('/medicines/:userId', async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.params.userId });
        res.json(medicines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete medicine
// Delete medicine
router.delete('/medicine/:userId', async (req, res) => {
    try {
      const { medicineId } = req.body;
      const userId = req.params.userId;
  
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(medicineId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
  
      // Find and delete medicine that matches both IDs
      const medicine = await Medicine.findOneAndDelete({
        _id: medicineId,
        userId: userId
      });
  
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
  
      res.json({ message: "Medicine deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });


module.exports = router;
