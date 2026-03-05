const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
       
const userAuthRoutes = require("./routes/userAuthRoutes");
const tableRoutes = require("./routes/tableRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/OrderRoutes")
const helmet = require("helmet");

dotenv.config();
connectDB();

const app = express(); 
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.set("io", io);


app.use("/api/users", userAuthRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));