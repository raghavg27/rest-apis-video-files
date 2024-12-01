// Imports
const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const { getVideoDuration } = require("../utils/videoUtils");
const auth = require("../middleware/auth");
const router = express.Router();

// Initialisations
const upload = multer({ dest: "./uploads/" });
const prisma = new PrismaClient();

// Routes

// Upload video route
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "Video file is required!" });
  }

  const maxFileSize = 25 * 1024 * 1024; // 25 MB

  if (file.size > maxFileSize) {
    console.log("File size: ", file.size);
    return res
      .status(400)
      .json({ message: "Maximum file size allowed is 25 MB " });
  }

  const duration = await getVideoDuration(file.path);

  if (duration < 5 || duration > 25) {
    console.log("Duration: ", duration);
    return res
      .status(400)
      .json({ message: "Video must be between 5 MB to 25 MB" });
  }
  try {
    const video = await prisma.videos.create({
      data: {
        file_path: file.path,
        original_name: file.originalname,
        size: file.size,
        duration,
      },
    });

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Internal server error, please try again later",
      message: `${error.message}`
    });
  }
});

module.exports = router;
