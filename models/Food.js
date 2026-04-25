const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tamilName: {type: String},
  price: { type: Number, required: true },
  image: { type: String, required: true },
   category: {type: String, required: true}
});

module.exports = mongoose.model("Food", foodSchema);