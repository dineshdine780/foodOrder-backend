const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  tableId: String,
  chairId: String,
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      image: String,
    },
  ],

  total: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Order", OrderSchema);