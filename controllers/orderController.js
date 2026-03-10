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


const Order = require("../models/Order");

exports.getLiveOrders = async (req, res) => {
  try {

    const orders = await Order.find().sort({ createdAt: -1 });

    const tables = {};

    orders.forEach(order => {

      const { tableId, chairId, items, serverName } = order;

      if (!tables[tableId]) {
        tables[tableId] = {
          server: serverName || "Unknown Server",
          chairs: {}
        };
      }

      if (!tables[tableId].chairs[chairId]) {
        tables[tableId].chairs[chairId] = [];
      }

      tables[tableId].chairs[chairId].push(...items);

    });

    res.json(tables);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};