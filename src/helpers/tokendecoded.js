const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt= require("jsonwebtoken");



// first verify the access token from the headers and then fetch from the database

const verifyJwt = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); 

        if (!token) {
            return res.status(401).json({ message: "Access token not provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS);

        let user = await prisma.users.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check if token has expired
        if (decoded.exp < Date.now() / 1000) {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ message: "No refresh token provided" });
            }

            const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH);
            user = await prisma.users.findUnique({
                where: {
                    id: decodedRefreshToken.id
                }
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
        }

        // Set user in request object
        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ message: "Token not verified" });
    }
}



// Middleware for allowing access only to superadmin
const requireSuperAdmin = (req, res, next) => {
    if (req.user.role === "superadmin") {

      next();
    } else {
      throw new Error(403, "Access forbidden. Requires superadmin role");
    }
  };
  
  // Middleware for allowing access only to admin
  const requireAdmin = (req, res, next) => {

    if (req.user.role === "admin" || req.user.role === "superadmin") {
      console.log(req.user.role);

      next(); // Allow access for admin
    } else {
      throw new APIError(403, "Access forbidden. Requires admin role");
    }
  };
  const requireUser = (req, res, next) => {

    if (req.user.role === "USER" ) {
      console.log(req.user.role);

      next(); // Allow access for admin
    } else {
      throw new APIError(403, "Access forbidden. Requires admin role");
    }
  };

module.exports = {
    verifyJwt,
    requireSuperAdmin,
    requireAdmin,
    requireUser
  };

