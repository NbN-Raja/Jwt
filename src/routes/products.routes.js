const { upload, ProductImages } = require('../../middleware/demomulter.js');
const { isSuperadmin, requireSuperAdmin, verifyJwt, requireUser } = require('../helpers/tokendecoded.js');

module.exports = (app) => {
    const router = require("express").Router();
    const productController = require("../controllers/product.controller.js");

    // Configure multer for parsing form data

    const imageFields = [
        { name: "image", maxCount: 1 },
        { name: "banner_image", maxCount: 1 },
      ];
    // Define routes
    router.post("/add-products",ProductImages.fields(imageFields), productController.addproduct); 
    router.get("/get-products",verifyJwt,requireUser, productController.getproducts);
    router.put("/update-products/:id",ProductImages.fields(imageFields), productController.updateproducts);


    // Mount routes under "/api"
    app.use("/api", router);
}
