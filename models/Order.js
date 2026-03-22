
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  orderType: {
    type: String,
    enum: ["dinein", "parcel"],
    default: "dinein"
  },

  customerName: {
    type: String
  },

  tableId: String,
  chairId: String,

  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      image: String,
      category: String
    },
  ],

  serverName:{
    type:String,
    required:true
  },

  total: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Preparing", "Ready", "Served", "ReadyForBill", "BillPrinted", "Completed", "Cancelled"],
    default: "Preparing",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }

});

module.exports = mongoose.model("Order", OrderSchema);