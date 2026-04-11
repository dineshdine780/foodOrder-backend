const express = require("express");
const router = express.Router();
const Table = require("../models/Table");


router.get("/", async (req, res) => {
  try {
    const table = await Table.findOne().sort({ createdAt: -1 });
    res.json({ tablesCount: table?.tablesCount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { tablesCount } = req.body;

    if (!tablesCount || tablesCount < 1) {
      return res.status(400).json({ message: "Invalid table count" });
    }

    const newTable = new Table({ tablesCount });
    await newTable.save();

    res.json({ message: "Saved in MongoDB!", tablesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving data" });
  }
});

module.exports = router;