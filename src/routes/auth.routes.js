module.exports = (app) => {
    const multer = require('multer');
    const router = require("express").Router();
    const authController = require("../controllers/auth.controller.js");

    // Configure multer for parsing form data
    const upload = multer();

    // Define routes
    router.post("/register",upload.none(), authController.post); 
    router.get("/register", authController.get);

    router.post("/login", upload.none(), authController.login)
    router.post("/reset", upload.none(), authController.reset)
    
    // Add vendors
    

    // Mount routes under "/api"
    app.use("/api", router);
}
