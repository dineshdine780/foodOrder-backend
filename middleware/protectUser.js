// const jwt = require("jsonwebtoken");
// const User = require("../models/User");


// const protectUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const secret = process.env.JWT_SECRET || "MY_SUPER_SECRET";

//     const decoded = jwt.verify(token, secret);
    
//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("AUTH ERROR:", error);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };


// module.exports = protectUser;    




 

  
const jwt = require("jsonwebtoken");
const User = require("../models/User");

  
const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "MY_SUPER_SECRET";

    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.id).select("-password");
   
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) { 
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
  
  
module.exports = protectUser;