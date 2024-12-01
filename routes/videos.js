// Imports
const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const { getVideoDuration, trimVideo } = require("../utils/videoUtils");
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
      message: `${error.message}`,
    });
  }
});

// Trim video route
router.post("/trim", auth, async (req, res) => {
  const { videoId, trimFrom, trimDuration } = req.body;

  // Validate input
  if (!videoId || !trimFrom || !trimDuration) {
    return res.status(400).json({
      message:
        "videoId, trimFrom (start or end), and trimDuration are required",
    });
  }

  if (trimFrom !== "start" && trimFrom !== "end") {
    return res.status(400).json({
      message: "trimFrom must be either 'start' or 'end'",
    });
  }

  const video = await prisma.videos.findUnique({ where: { id: videoId } });

  if (!video) return res.status(404).json({ message: "Video not found" });

  const originalDuration = await getVideoDuration(video.file_path);

  if (trimDuration > originalDuration) {
    return res.status(400).json({
      message: "trimDuration exceeds the original video duration",
    });
  }

  // Determine trimming parameters
  let startTime = 0;
  let duration = originalDuration;

  if (trimFrom === "start") {
    startTime = 0;
    newDuration = originalDuration - trimDuration;
  } else if (trimFrom === "end") {
    startTime = originalDuration - trimDuration;
    newDuration = trimDuration;
  }

  if (newDuration <= 0) {
    return res.status(400).json({ message: "Invalid duration after trimming" });
  }
  try {
    const outputPath = `uploads/trimmed-${Date.now()}.mp4`;
    await trimVideo(video.file_path, outputPath, startTime, trimDuration);

    res.json({ message: "Video trimmed", path: outputPath });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Internal server error, please try again later",
      message: `${error.message}`,
    });
  }
});

module.exports = router;
