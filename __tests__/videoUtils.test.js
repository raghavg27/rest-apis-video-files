jest.mock("get-video-duration", () => ({
  getVideoDurationInSeconds: jest.fn(() => Promise.resolve(10)), // Mock duration
}));

const {
  getVideoDuration,
  trimVideo,
  mergeVideos,
} = require("../utils/videoUtils");

describe("Video Utils Tests", () => {
  test("getVideoDuration should return a mocked duration", async () => {
    const mockFilePath = "mock/video.mp4";

    const duration = await getVideoDuration(mockFilePath);
    expect(duration).toBe(10);
  }, 20000);

  test("trimVideo should resolve with the output path", async () => {
    const inputPath = "mock/video.mp4";
    const outputPath = "mock/output.mp4";

    await expect(trimVideo(inputPath, outputPath, 0, 5)).resolves.toBe(
      outputPath
    );
  });

  test("mergeVideos should resolve with the output path", async () => {
    jest.setTimeout(30000);
    const videoPaths = ["mock/video1.mp4", "mock/video2.mp4"];
    const outputPath = "mock/merged.mp4";

    await expect(mergeVideos(videoPaths, outputPath)).resolves.toBe(outputPath);
  }, 30000);
});
