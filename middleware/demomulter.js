const multer = require("multer");
const path = require("path");
const fs= require("fs")
const createStorage = (folderName) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            // Determine the destination folder based on the folder name
            cb(null, path.join(__dirname, `../public/${folderName}/`));
        },
        filename: function (req, file, cb) {
            // Generate a unique filename (customize as needed)
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
    });
};

// Use the createStorage function to configure upload and ProductImages
const upload = multer({ storage: createStorage("default") }); // Provide a default folder name if needed
const ProductImages = multer({
    storage: createStorage("images"),
    limits: { fileSize: 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false);
        }
    }
});

// Function to process the uploaded image
const processImage = async (file, folderName, imageName) => {
    try {
        if (!file) return null;

        const Timestamp= Date.now();
        const filename = `${imageName}--${Timestamp}-${file.originalname}`;
        const destination = path.join(__dirname, `../public/images/${folderName}`);

        // Ensure the destination folder exists, if not, create it
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        const outputPath = path.join(destination, filename);

        // Move the uploaded file to the specified destination
        await fs.promises.rename(file.path, outputPath);

        // Return the path where the image is saved
        return `/images/${folderName}/${filename}`;
    } catch (error) {
        console.error("Error processing image:", error);
        throw error;
    }
};


// Multer error handler
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

module.exports = {
    upload,
    processImage,
    ProductImages,
    MulterError,
    createStorage
};
