const express = require("express");
const router = express.Router();
const Food = require("../models/Food");


router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Error fetching foods" });    
  } 
});
   
 
router.post("/", async (req, res) => {
  try {
    const { name, price, image } = req.body;

    const newFood = new Food({ name, price, image });
    await newFood.save();

    res.json({ message: "Food added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding food" }); 
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting food" });
  }
}); 

module.exports = router;