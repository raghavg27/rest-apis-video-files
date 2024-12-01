const { getVideoDurationInSeconds } = require("get-video-duration");

async function getVideoDuration(filePath) {
  try {
    const duration = await getVideoDurationInSeconds(filePath);
    return duration;
  } catch (err) {
    console.error("Error getting video duration:", err);
    throw new Error("Unable to determine video duration.");
  }
}

module.exports = { getVideoDuration };
