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
    const { name, tamilName, category, price, image } = req.body;

    const newFood = new Food({
  name,
  tamilName: tamilName && tamilName.trim() !== "" ? tamilName : name,
  category,
  price,
  image
});
    await newFood.save();

    const io = req.app.get("io");

  io.emit("foodAdded", newFood);

    res.json({ message: "Food added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding food" }); 
  }
}); 



router.put("/:id", async (req, res) => {
  try {

    const updateData = {
      ...req.body,
      tamilName:
        req.body.tamilName && req.body.tamilName.trim() !== ""
          ? req.body.tamilName
          : req.body.name
    };

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(food);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// router.put("/:id", async (req, res) => {
//   try {
//     const food = await Food.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true }
//     );

//     res.json(food);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


router.delete("/:id", async (req, res) => {
  try { 
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting food" });
  }
}); 



module.exports = router;