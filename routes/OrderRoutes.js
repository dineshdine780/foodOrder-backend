const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


router.post("/", async (req, res) => {
  const { tableId, chairId, items } = req.body;

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const newOrder = new Order({
    tableId,
    chairId,
    items,
    total
  });

  await newOrder.save();

  res.json({ message: "Order Placed", newOrder });
});


router.get("/table/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await Order.find({ tableId });

   
    const chairMap = {};

    orders.forEach(order => {
      if (!chairMap[order.chairId]) {
        chairMap[order.chairId] = {
          chairId: order.chairId,
          total: 0
        };
      }

      order.items.forEach(item => {
        chairMap[order.chairId].total += item.price * item.qty;
      });
    });

    res.json(Object.values(chairMap)); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/table/:tableId/chair/:chairId", async (req, res) => {
  const { tableId, chairId } = req.params;

  const order = await Order.findOne({ tableId, chairId });

  if (!order) return res.json({ items: [], total: 0 });

  res.json(order);
});


router.delete("/table/:tableId/chair/:chairId", async (req, res) => {
  const { tableId, chairId } = req.params;

  await Order.findOneAndDelete({ tableId, chairId });

  res.json({ message: "Bill cleared" });
});



router.post("/combined", async (req, res) => {
  const { chairs, tableId } = req.body;

  const orders = await Order.find({
    tableId,
    chairId: { $in: chairs }
  });

  const total = orders.reduce((acc, o) => acc + o.total, 0);

  res.json({ total });
});


router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;