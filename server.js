const express = require('express');
const bodyParser = require("body-parser");
const videosRouter = require("./routes/videos");
require("dotenv").config();

const app = express()

const PORT = process.env.PORT || 9000;

app.use(express.json())

app.use(bodyParser.json());
app.use("/videos", videosRouter);

app.get("/", (req, res) => {
    return res.status(200).send({   
        "ping":"pong"
    })
});

app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});