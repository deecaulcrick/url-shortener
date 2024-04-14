require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const ShortUrl = require("./models/shortUrl");
const app = express();

mongoose.connect(process.env.MONGO_URI);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

const urlDatabase = {};

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

// Your first API endpoint

app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url.trim();

  function isValidUrl(url) {
    // Regular expression for URL validation
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
  }

  if (!isValidUrl(url)) {
    res.json({
      error: "invalid url",
    });
  } else {
    ShortUrl.create({ full: req.body.url });
    const shortUrl = await ShortUrl.findOne({ full: req.body.url });
    res.json({
      original_url: req.body.url,
      short_url: shortUrl.short,
    });
  }
});

app.get("/api/:shorturl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });
  console.log(shortUrl);

  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});
app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });

  res.redirect(shortUrl.full);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
