

const Order = require("../models/Order");

exports.getLiveOrders = async (req, res) => {
  try {

   const orders = await Order.find({
    status: { $nin: ["Completed", "completed"] }
   }).sort({ createdAt: -1 });

    const tables = {};

    orders.forEach(order => {

      
      if (order.orderType === "parcel") {

        if (!tables["parcel"]) {
          tables["parcel"] = {
            parcelOrders: []
          };
        }

        tables["parcel"].parcelOrders.push({
          items: order.items || [],
          status: order.status,
          total: order.total
        });

        return;
      }

      
      if (!order.tableId || !order.chairId) return;

      
      const table = order.tableId;
      const chair = order.chairId;

      if (!tables[table]) {
        tables[table] = {
          server: order.serverName,
          chairs: {}
        };
      }

      if (!tables[table].chairs[chair]) {
        tables[table].chairs[chair] = [];
      }

      tables[table].chairs[chair].push({
        items: order.items || [],
        status: order.status,
        total: order.total
      });

    });

    res.json(tables);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.completeOrder = async (req, res) => {
  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    
    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getOrderHistory = async (req, res) => {
  try {

    const { date, item, user } = req.query;

    let filter = { status: "Completed" };

  
    if (date) {
      const start = new Date(date);
      const end = new Date(date);

      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    
    if (user) {
      filter.serverName = user;
    }

    let orders = await Order.find(filter).sort({ createdAt: -1 });

    
    if (item) {
      orders = orders.filter(order =>
        order.items.some(i =>
          i.name.toLowerCase().includes(item.toLowerCase())
        )
      );
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};