const { isSuperadmin, requireSuperAdmin, verifyJwt, requireUser } = require('../helpers/tokendecoded.js');

module.exports = (app) => {
    const multer = require('multer');
    const router = require("express").Router();
    const productController = require("../controllers/product.controller.js");

    // Configure multer for parsing form data
    const upload = multer();

    // Define routes
    router.post("/add-products",upload.none(), productController.addproduct); 
    router.get("/get-products",verifyJwt,requireUser, productController.getproducts);


    // Mount routes under "/api"
    app.use("/api", router);
}
