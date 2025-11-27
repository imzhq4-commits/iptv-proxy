const express = require("express");
const path = require("path");
const app = express();

// Serve files from /public
app.use(express.static(path.join(__dirname, "public")));

// When someone goes to "/", load index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
