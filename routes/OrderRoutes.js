const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protectUser = require("../middleware/protectUser");

const { getLiveOrders } = require("../controllers/orderController");

router.get("/live", getLiveOrders);


// router.post("/", protectUser, async (req, res) => {
//   const { tableId, chairId, items } = req.body;

//   const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

//   const newOrder = new Order({
//     userId: req.user.id,
//     serverName: req.user.name,
//     tableId,
//     chairId,
//     items,
//     total
//   });

//   await newOrder.save();

//   const io = req.app.get("io");
//   // io.emit("newOrder", newOrder);
//   io.emit("orderPlaced", newOrder);

//   res.json({ message: "Order Placed", newOrder });
// });


router.post("/", protectUser, async (req, res) => {

  console.log("USER:", req.user);

  const { tableId, chairId, items } = req.body;

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const newOrder = new Order({
    userId: req.user._id,
    serverName: req.user.name,
    tableId,
    chairId,
    items,
    total
  });

  await newOrder.save();

  const io = req.app.get("io");
  io.emit("orderPlaced", newOrder);

  res.json({ message: "Order Placed", newOrder });
});


router.get("/table/:tableId", protectUser, async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await Order.find({
      tableId,
      userId: req.user.id
    });

    const chairMap = {};

    orders.forEach(order => {
      if (!chairMap[order.chairId]) {
        chairMap[order.chairId] = {
          chairId: order.chairId,
          total: 0,
          status: order.status
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






router.get("/table/:tableId/chair/:chairId", protectUser, async (req, res) => {
  try {
    const { tableId, chairId } = req.params;

    // const orders = await Order.find({ tableId, chairId });

    const orders = await Order.find({
      tableId,
      chairId,
      userId: req.user.id
    });

    let items = [];
    let total = 0;
    let status = "Preparing";

    orders.forEach(order => {
      status = order.status;

      order.items.forEach(item => {
        items.push(item);
        total += item.price * item.qty;
      });
    });

    res.json({ items, total, status });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.put("/:id/status", protectUser, async (req, res) => {
  const { status } = req.body;

 const order = await Order.findOneAndUpdate(
  {
    _id: req.params.id,
    userId: req.user.id
  },
  { status },
  { new: true }
);

  const io = req.app.get("io");
  io.emit("orderUpdated", order);

  res.json(order);
});





router.delete("/table/:tableId/chair/:chairId", protectUser, async (req, res) => {
  const { tableId, chairId } = req.params;

  await Order.deleteMany({
    tableId,
    chairId,
    userId: req.user.id
  });

  res.json({ message: "Bill cleared" });
});



router.delete("/table/:tableId/complete", protectUser, async (req, res) => {
  try {

    const tableId = Number(req.params.tableId);

    // await Order.deleteMany({ tableId: tableId });

    await Order.deleteMany({
      tableId,
      userId: req.user.id
    });

    res.json({ message: "Table bill completed and cleared" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post("/combined", protectUser, async (req, res) => {
  const { chairs, tableId } = req.body;

  const orders = await Order.find({
  tableId,
  chairId: { $in: chairs },
  userId: req.user.id
});

  const total = orders.reduce((acc, o) => acc + o.total, 0);

  res.json({ total });
});





router.get("/", protectUser, async (req, res) => {
  const orders = await Order.find({
    userId: req.user.id
  }).sort({ createdAt: -1 });

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




router.put("/:id/cancel", async (req, res) => {
  try {

    const order = await Order.findOneAndUpdate(
  {
    _id: req.params.id,
    userId: req.user.id
  },
  { status: "Cancelled" },
  { new: true }
);

    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;