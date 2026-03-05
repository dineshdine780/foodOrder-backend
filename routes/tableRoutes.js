const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const FILE = path.join(__dirname, "../data/tables.json");


const dataFolder = path.join(__dirname, "../data");
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}


if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({ tablesCount: 4 }));
}


router.get("/", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(FILE));
    res.json({ tablesCount: data.tablesCount });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Server error reading file" });
  }
});


router.post("/", (req, res) => {
  try {
    const { tablesCount } = req.body;

    if (!tablesCount || tablesCount < 1) {
      return res.status(400).json({ message: "Invalid table count" });
    }

    fs.writeFileSync(FILE, JSON.stringify({ tablesCount }));
    res.json({ message: "Tables updated!", tablesCount });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ message: "Server error writing file" });
  }
});
 
module.exports = router;