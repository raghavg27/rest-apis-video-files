const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const { getVideoDurationInSeconds } = require("get-video-duration");
const fs = require("fs");

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

async function getVideoDuration(filePath) {
  try {
    const duration = await getVideoDurationInSeconds(filePath);
    return duration;
  } catch (err) {
    console.error("Error getting video duration:", err);
    throw new Error("Unable to determine video duration.");
  }
}

async function trimVideo(inputPath, outputPath, startTime, duration) {
  if (!inputPath) {
    console.log("input path: ", inputPath);

    throw new Error("Input path is not specified or invalid.");
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

async function mergeVideos(videoPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();

    // Validate and add video files
    videoPaths.forEach((file) => {
      if (!file || !fs.existsSync(file)) {
        return reject(new Error(`Invalid or missing video file: ${file}`));
      }
      ffmpegCommand.input(file);
    });

    ffmpegCommand
      .mergeToFile(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
}

module.exports = { getVideoDuration, trimVideo, mergeVideos };