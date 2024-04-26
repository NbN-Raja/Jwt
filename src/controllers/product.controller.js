const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../helpers/prismaerror");
const { processImage,createStorage } = require("../../middleware/demomulter");
const ApiResponse = require("../helpers/APIResponse");

const prisma = new PrismaClient();

const imageFields = [
  { name: "image", maxCount: 1 },
  { name: "banner_image", maxCount: 1 },
];
// create a function for image uploads
async function imageField(req, res) {
  const imagePaths = {};

  for (const field of imageFields) {
    if (req.files[field.name]) {
      const imagePath = await processImage(req.files[field.name][0], "products", field.name);
      imagePaths[field.name] = imagePath;
    }
  }
  return imagePaths; // Return the imagePaths object
}

// Products Add With The Images
exports.addproduct = async (req, res) => {
  try {
    const imagePaths = await imageField(req, res);

    const Addproduct = await prisma.products.create({
      data: {
        ...req.body,
        ...(imagePaths.image && { image: imagePaths.image }),
        ...(imagePaths.banner_image && { banner_image: imagePaths.banner_image }),
      },
    });

    if (!Addproduct) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

    res.status(201).send(new ApiResponse(), 200, Addproduct, "Product AddedSuccessfuly");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateproducts = async (req,res)=>{
  try {
    const id= parseInt(req.params.id)
    const imagePaths = await imageField(req, res);

    const Addproduct = await prisma.products.updateMany({
      where: {
        id:id
      },
      data: {
        ...req.body,
        ...(imagePaths.image && { image: imagePaths.image }),
        ...(imagePaths.banner_image && { banner_image: imagePaths.banner_image }),
      },
    });

    if (!Addproduct) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

    res.status(201).send(new ApiResponse(), 200, Addproduct, "Product AddedSuccessfuly");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
exports.getproducts = async (req, res) => {};

