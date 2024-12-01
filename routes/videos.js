// Imports
const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const {
  getVideoDuration
} = require("../utils/videoUtils");
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
    return res.status(400).json({ message: "File size exceeds limit" });
  }

  const duration = await getVideoDuration(file.path);
  console.log("Duration: ", duration);
  
  if (duration < 5 || duration > 25) {
    return res.status(400).json({ message: "Video duration out of bounds" });
  }

  const video = await prisma.videos.create({
    data: {
      file_path: file.path,
      original_name: file.originalname,
      size: file.size,
      duration,
    },
  });

  res.json(video);
});

module.exports = router;
