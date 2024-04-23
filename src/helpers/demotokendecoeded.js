const jwt = require("jsonwebtoken");

const verifyJwt = async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new APIError(401, "Unauthorized Token");
    }

    let user = null;

    try {
      // Verify the access token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user information from the database using the decoded token
      user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      

      if (!user) {
        throw new APIError(401, "Invalid access token");
      }
    } catch (error) {
      // If access token is invalid or expired
      if (error.name === "TokenExpiredError") {
        // Get the refresh token from the request
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new APIError(401, "No refresh token provided");
        }

        // Verify the refresh token
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH);

        // Get user information from the database using the decoded refresh token
        user = await User.findById(decodedRefreshToken._id).select("-password -refreshToken");

        if (!user) {
          throw new APIError(401, "Invalid refresh token");
        }
      } else {
        throw error;
      }
    }

    // Add user information to the request object
    req.user = user;
    next();
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid Access Token");
  }
};

// Middleware for allowing access only to superadmin
const requireSuperAdmin = (req, res, next) => {
    if (req.user.role === "superadmin") {

      next(); // Allow access for superadmin
    } else {
      throw new APIError(403, "Access forbidden. Requires superadmin role");
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

module.exports = {
    verifyJwt,
    requireSuperAdmin,
    requireAdmin
  };
