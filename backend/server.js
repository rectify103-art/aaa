const express = require("express");
const cors = require("cors");

require("./database/database");

const uploadRoute = require("./routes/upload");
const queueRoute = require("./routes/queue");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/upload", uploadRoute);
app.use("/queue", queueRoute);

// Home Route
app.get("/", (req, res) => {
    res.send("Auto Video Publisher Server Running");
});

// Start Server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});