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

  const io = req.app.get("io");
  io.emit("newOrder", newOrder);

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

router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  const io = req.app.get("io");
  io.emit("orderUpdated", order);

  res.json(order);
});


router.delete("/table/:tableId/chair/:chairId", async (req, res) => {
  const { tableId, chairId } = req.params;

  // await Order.findOneAndDelete({ tableId, chairId });

  await Order.deleteMany({
  tableId: Number(tableId),
  chairId: Number(chairId)
});

  res.json({ message: "Bill cleared" });
});


router.delete("/table/:tableId/complete", async (req, res) => {
  try {

    const tableId = Number(req.params.tableId);

    await Order.deleteMany({ tableId: tableId });

    res.json({ message: "Table bill completed and cleared" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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


router.put("/orders/:id/complete", async (req, res) => {
  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;