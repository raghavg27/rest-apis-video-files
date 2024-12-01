const request = require("supertest");
const app = require("../testServer");

describe("Video Routes Tests", () => {
  it("POST /videos/upload - should fail if no file is uploaded", async () => {
    const response = await request(app)
      .post("/videos/upload")
      .set("Authorization", "Bearer videoverse");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Video file is required!");
  });

  it("POST /videos/trim - should fail with missing parameters", async () => {
    const response = await request(app)
      .post("/videos/trim")
      .set("Authorization", "Bearer videoverse")
      .send({ videoId: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "videoId, trimFrom (start or end), and trimDuration are required"
    );
  });

  it("POST /videos/merge - should fail with no video IDs", async () => {
    const response = await request(app)
      .post("/videos/merge")
      .set("Authorization", "Bearer videoverse")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "videoIds must be a non-empty array!"
    );
  });

  it("POST /videos/share - should fail with missing parameters", async () => {
    const response = await request(app)
      .post("/videos/share")
      .set("Authorization", "Bearer videoverse");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "videoId and expiryHours are required!"
    );
  });

  it("GET /videos/shared/:token - should fail for invalid token", async () => {
    const token = "invalid_token";
    const response = await request(app).get(`/videos/shared/${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Invalid or expired link");
  });
});
