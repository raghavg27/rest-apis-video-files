const express = require("express");
const videosRouter = require("./routes/videos");

const app = express();
app.use(express.json());
app.use("/videos", videosRouter);

module.exports = app;
