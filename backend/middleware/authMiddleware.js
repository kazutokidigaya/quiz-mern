import jwt from "jsonwebtoken";
import redis from "../config/redisClient.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No token provided. Authorization denied!" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token not found in Authorization header." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the token exists in Redis
    const storedToken = await redis.get(decoded.id);

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = decoded; // Attach the decoded user info to the request object

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
