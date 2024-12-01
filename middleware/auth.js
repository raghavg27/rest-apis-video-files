// All API calls must be authenticated (static API tokens)

require("dotenv").config();

const VALID_TOKENS = process.env.VALID_TOKENS
  ? process.env.VALID_TOKENS.split(",")
  : [];

const authentication = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token || !VALID_TOKENS.includes(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

module.exports = authentication;
