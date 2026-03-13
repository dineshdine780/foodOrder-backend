// const Order = require("../models/Order");

// exports.getLiveOrders = async (req, res) => {
//   try {

//     const orders = await Order.find().sort({ createdAt: -1 });

//     const tables = {};

//     orders.forEach(order => {

//       const { tableId, chairId, items } = order;

//       if (!tables[tableId]) {
//         tables[tableId] = {
//           server: "Server", 
//           chairs: {}
//         };
//       }

//       if (!tables[tableId].chairs[chairId]) {
//         tables[tableId].chairs[chairId] = [];
//       }

//       tables[tableId].chairs[chairId].push(...items);

//     });

//     res.json(tables);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };





// const Order = require("../models/Order");

// exports.getLiveOrders = async (req, res) => {
//   try {

//     const orders = await Order.find().sort({ createdAt: -1 });

//     const tables = {};

//     orders.forEach(order => {

//       const { tableId, chairId, items, serverName, status } = order;

//       if (!tables[tableId]) {
//         tables[tableId] = {
//           server: serverName || "Unknown Server",
//           chairs: {}
//         };
//       }

//       if (!tables[tableId].chairs[chairId]) {
//         tables[tableId].chairs[chairId] = [];
//       }

//       tables[tableId].chairs[chairId].push({
//   items,
//   status: status || "Preparing"
// });

//     });

//     res.json(tables);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



const Order = require("../models/Order");

exports.getLiveOrders = async (req, res) => {
  try {

    const orders = await Order.find().sort({ createdAt: -1 });

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


