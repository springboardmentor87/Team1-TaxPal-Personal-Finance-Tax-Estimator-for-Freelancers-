const express = require("express");
const db = require("./config/db");
const app = express();
const authRoutes = require("./routes/transactionRoute");
const cors = require("cors");

const port = 8080;

app.use(cors());
app.use(express.json());



app.use("/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("working");
})
app.listen(port, () => {
    console.log(`port is running at ${port}`);
})