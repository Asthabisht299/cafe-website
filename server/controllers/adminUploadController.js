
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      image_url: req.file.path,
    });
  } catch (error) {
    next(error);
  }
};
