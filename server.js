import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(url);
    const data = await response.arrayBuffer();

    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.send(Buffer.from(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
