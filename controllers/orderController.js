
const Order = require("../models/Order");

exports.getLiveOrders = async (req, res) => {
  try {

   const orders = await Order.find({
  status: { $nin: ["Completed", "completed", "Cancelled", "cancelled"] }
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
    const { fromDate, toDate, date, item, user, category } = req.query;

    let filter = {
      status: { $in: ["Completed", "completed"] }
    };
    
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    } 
    else if (fromDate && toDate) {
      const start = new Date(fromDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(toDate);
      end.setUTCHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }  
    
    if (user) {
      filter.serverName = { $regex: user, $options: "i" };
    }
    
    if (item) {
      filter["items.name"] = { $regex: item, $options: "i" };
    }
    
    if (category && item) {
      filter.items = {
        $elemMatch: {
          category: category,
          name: { $regex: item, $options: "i" }
        }
      };
    }
    else if (category) {
      filter.items = {
        $elemMatch: {
        category: category 
      }
    };
  } 


else if (item) {
  filter["items.name"] = { $regex: item, $options: "i" };
}

    const orders = await Order.find(filter).sort({ createdAt: 1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getMonthlyReport = async (req, res) => {

  try {

    const { month, year } = req.query;
    
    const currentDate = new Date();
    const selectedMonth = month ? Number(month) : currentDate.getMonth() + 1;
    const selectedYear = year ? Number(year) : currentDate.getFullYear();

    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ["Completed", "completed"] }
    });

    
    const dailySales = {};
    let total = 0;

    orders.forEach(order => {
      const day = new Date(order.createdAt).getDate();

      if (!dailySales[day]) {
        dailySales[day] = 0;
      }

      dailySales[day] += order.total;
      total += order.total;
    });

    res.json({
      month: selectedMonth,
      year: selectedYear,
      total,
      dailySales
    });  

  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};