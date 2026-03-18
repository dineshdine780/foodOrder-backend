const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protectUser = require("../middleware/protectUser");

const { getLiveOrders, getOrderById, getOrderHistory } = require("../controllers/orderController");

router.get("/live", getLiveOrders);
router.get("/history", getOrderHistory);




router.post("/", protectUser, async (req, res) => {
    
  const { tableId, chairId, items, orderType, customerName } = req.body;
   
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No food items provided" });
  }
   
  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  

  const newOrder = new Order({
  userId: req.user._id,
  serverName: req.user.name,
  tableId,
  chairId,
  items,
  total,
  orderType,
  customerName
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




router.put("/table/:tableId/chair/:chairId/ready-for-bill", protectUser, async (req, res) => {

  try {

    const { tableId, chairId } = req.params;

    const orders = await Order.updateMany(
      {
        tableId,
        chairId,
        userId: req.user.id,
        status: "Served"
      },
      {
        status: "ReadyForBill"
      }
    );

     const io = req.app.get("io");

const updatedOrders = await Order.find({
  tableId,
  chairId,
  userId: req.user.id
});

updatedOrders.forEach(order => {
  io.emit("orderUpdated", order);
});

    res.json({ message: "Order moved to Ready For Bill", orders });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});



// router.put("/table/:tableId/ready-for-bill", async (req, res) => {
//   try {

//     const { tableId } = req.params;

//     await Order.updateMany(
//       { tableId: tableId },
//       { $set: { status: "ReadyForBill" } }
//     );

//     res.json({ message: "Table moved to ReadyForBill" });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });



router.put("/table/:tableId/ready-for-bill", async (req, res) => {

  const tableId = req.params.tableId;

  await Order.updateMany(
    {
      tableId: tableId,
      status: { $ne: "Completed" }
    },
    {
      $set: { status: "ReadyForBill" }
    }
  );

  res.json({ message: "Table moved to ReadyForBill" });

});




router.get("/table/:tableId", async (req, res) => {

  const orders = await Order.find({
    tableId: req.params.tableId,
    status: { $ne: "Completed" }
  });

  res.json(orders);

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

 
router.get("/parcel", protectUser, async (req, res) => {
  try {
    const orders = await Order.find({
      orderType: "parcel",
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(orders);

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
 
 
 
router.get("/", async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.json(orders);
})


router.get("/", protectUser, async (req, res) => {
  const orders = await Order.find({
    orderType: "dinein",
    userId: req.user.id
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.json(orders);
}); 



router.get("/completed-today", async (req, res) => {

  try {

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const count = await Order.countDocuments({
      status: { $in: ["Completed", "completed"] },
      createdAt: { $gte: start, $lte: end }
    });

    res.json({ completed: count });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});
 
   



router.put("/:id/complete", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});  
  
 
 
router.put("/:id/cancel", async (req, res) => {

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "Cancelled" },
    { new: true }
  );

  const io = req.app.get("io");
  io.emit("orderUpdated", order);

  res.json(order);
});


router.get("/:id", protectUser, async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;