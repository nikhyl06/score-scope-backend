const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "questions",
  });
  return result.secure_url;
};

module.exports = { uploadToCloudinary };
