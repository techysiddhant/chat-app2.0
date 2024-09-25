const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const db = require("../configs/db");

const protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        console.log(token)
        //decodes token id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        console.log(req.user);
        const user = await db.user.findUnique({
            where: {
              id: decoded.id,
            },
          });
        req.user = user;
  
        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  });
  
  module.exports = { protect };

