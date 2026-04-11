// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const helmet = require("helmet");
// const http = require("http");
// const { Server } = require("socket.io");

// const userAuthRoutes = require("./routes/userAuthRoutes");
// const tableRoutes = require("./routes/tableRoutes");
// const foodRoutes = require("./routes/foodRoutes");
// const orderRoutes = require("./routes/OrderRoutes");

// dotenv.config();
// connectDB();

// const app = express();
// const server = http.createServer(app);

// app.use(cors({ origin: "*", credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(helmet());


// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
//   transports: ["websocket"], 
//   pingTimeout: 60000,
//   pingInterval: 25000,
// });

// app.set("io", io);


// app.use("/api/users", userAuthRoutes);
// app.use("/api/tables", tableRoutes);
// app.use("/api/foods", foodRoutes);
// app.use("/api/orders", orderRoutes);


// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("disconnect", (reason) => {
//     console.log("User disconnected:", reason);
//   });
// });

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }); 




const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const userAuthRoutes = require("./routes/userAuthRoutes");
const tableRoutes = require("./routes/tableRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/OrderRoutes");

dotenv.config();


connectDB();

const app = express();
const server = http.createServer(app);


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, 
});


app.set("io", io);

io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log(" User disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error:", err.message);
  });
});


app.use("/api/users", userAuthRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);


app.get("/", (req, res) => {
  res.send("Restaurant POS API Running...");
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});