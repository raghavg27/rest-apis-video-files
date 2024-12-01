// Imports
const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const {
  getVideoDuration,
  trimVideo,
  mergeVideos,
} = require("../utils/videoUtils");
const auth = require("../middleware/auth");
const router = express.Router();
const fs = require("fs");
const { generateToken } = require("../utils/tokenUtils");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

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

// Merge videos route
router.post("/merge", auth, async (req, res) => {
  const { videoIds } = req.body;

  // Validate input
  if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
    return res
      .status(400)
      .json({ message: "videoIds must be a non-empty array!" });
  }

  try {
    // Fetch video records from the database
    const videos = await prisma.videos.findMany({
      where: { id: { in: videoIds } },
    });

    // Check if all requested videos are found
    if (videos.length !== videoIds.length) {
      return res.status(404).json({ message: "One or more videos not found" });
    }

    // Sort videos based on the order of IDs provided in videoIds
    const sortedVideos = videoIds.map((id) =>
      videos.find((video) => video.id === id)
    );

    // Validate video file paths
    const paths = sortedVideos.map((v) => v.file_path);
    for (const path of paths) {
      if (!fs.existsSync(path)) {
        return res.status(400).json({
          message: `Video file not found: ${path}`,
        });
      }
    }

    // Generate output path
    const outputPath = `uploads/merged-${Date.now()}.mp4`;

    // Perform the merge operation
    await mergeVideos(paths, outputPath);
    res.json({ message: "Videos merged successfully", path: outputPath });
  } catch (error) {
    console.error("Error merging videos:", error);
    res.status(500).send({
      error: "Internal server error, please try again later",
      message: `${error.message}`,
    });
  }
});

// Share video link route
router.post("/share", auth, async (req, res) => {
  const { videoId, expiryHours } = req.body;

  // Validate input
  if (!videoId || !expiryHours) {
    return res
      .status(400)
      .json({ message: "videoId and expiryHours are required!" });
  }

  const video = await prisma.videos.findUnique({ where: { id: videoId } });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    // Generate a unique token and expiry time
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    // Store the shared link in the database
    const sharedLink = await prisma.shared_links.create({
      data: {
        video_id: video.id,
        token,
        expires_at: expiresAt,
      },
    });

    res.json({
      message: "Link generated successfully",
      link: `http://localhost:9000/videos/shared/${sharedLink.token}`,
      expiresAt,
    });
  } catch (error) {
    console.error("Error generating shared link:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Access shared video link route
router.get("/shared/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Find the shared link using findFirst
    const sharedLink = await prisma.shared_links.findFirst({
      where: { token }, // Find the first shared link with this token
      include: { videos: true },
    });

    if (!sharedLink) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    // Check if the link has expired
    const now = new Date();
    if (sharedLink.expiresAt < now) {
      return res.status(410).json({ message: "This link has expired" });
    }

    // Respond with video details
    res.json({
      message: "Shared video link is valid",
      video: {
        id: sharedLink.videos.id,
        file_path: sharedLink.videos.file_path,
        original_name: sharedLink.videos.original_name,
      },
    });
  } catch (error) {
    console.error("Error accessing shared link:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
