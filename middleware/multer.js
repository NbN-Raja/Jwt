const multer = require("multer")
const sharp= require("sharp")
const path = require("path")
const fs= require("fs")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine the destination folder based on the field name
        const folderName = req.params.folderName || 'images'; // Default to 'images' if folderName is not provided

        cb(null, path.join(__dirname, `../public/${folderName}/`));
    },
    filename: function (req, file, cb) {
        // Generate a unique filename (you can customize this as needed)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Function to process the uploaded image

const processImage = async (file, folderName, imageName, outputFormat) => {
    try {
        if (!file) return null;

        const filename = `${imageName}-${file.originalname}`;
        console.log(filename);
        const outputPath = path.join(__dirname, `../public/${folderName}`, filename);

        // Log the output path for debuggin
        return `/images/${folderName}/${filename}`;
    } catch (error) {
        console.error("Error processing image:", error);
        throw error;
    }
};



// now provide middleware for the images

const maxSize= 1024* 1024;
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false); 
    }
};

const uploadConfig = {
    storage: storage,
    limits: { fileSize: maxSize }, 
    fileFilter: fileFilter 
};

const ProductImages  = multer(uploadConfig);

// multer error 
const MulterError = async (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Image too large. Maximum size allowed is 1 MB.' });
        } else {
            return res.status(400).json({ error: err.message });
        }
    } else if (err instanceof Error && err.message.startsWith('Invalid file type')) {
        // File format error
        return res.status(400).json({ error: err.message });
    } else {
        // Other errors
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports={
    upload,
    processImage,
    uploadConfig,
    ProductImages,
    MulterError,
    storage
}