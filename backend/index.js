const express = require("express");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    cb(null, safeTimestamp + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow access from any domain
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  ); // allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // allowed headers
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3005, () => {
      console.log("server is running on the port 3005");
    });
  })
  .catch((err) => {
    console.log(err);
  });
