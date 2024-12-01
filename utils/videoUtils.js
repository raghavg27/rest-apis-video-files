const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { getVideoDurationInSeconds } = require("get-video-duration");

ffmpeg.setFfmpegPath(ffmpegStatic);

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

module.exports = { getVideoDuration, trimVideo };
