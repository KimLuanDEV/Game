const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Cho phép truy cập file tĩnh (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// API test
app.get("/api/test", (req, res) => {
    res.json({ message: "Server hoạt động OK" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});
