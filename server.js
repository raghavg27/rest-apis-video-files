const express = require('express');

const app = express()

const PORT = 9000;

app.use(express.json())

app.get("/", (req, res) => {
    return res.status(200).send({
        "ping":"pong"
    })
});

app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});