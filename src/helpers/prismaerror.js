const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define error handling middleware
function errorHandler(err, req, res, next) {
    if (err instanceof prisma.PrismaClientValidationError) {
        // Parse Prisma error message
        const errorMessage = err.message.replace(/\n/g, ' '); // Remove newlines for formatting

        // Send formatted error message to client
        res.status(400).json({
            error: "Prisma Error",
            message: errorMessage
        });
    } else {
        // Pass other errors to default error handler
        next(err);
    }
}

// Register error handling middleware
module.exports= errorHandler