const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tablesCount: {
    type: Number,
    required: true,
    min: 6,
  },
}, { timestamps: true });

module.exports = mongoose.model("Table", tableSchema);