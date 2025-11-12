const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the uploads directory path
const uploadsDir = path.join(__dirname, "../uploads");

// Create a middleware to ensure uploads directory exists
const ensureUploadsDirExists = (req, res, next) => {
  if (!fs.existsSync(uploadsDir)) {
    console.log("📁 Creating uploads directory on demand...");
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.error(`❌ Error creating uploads directory: ${err.message}`);
      return res
        .status(500)
        .send("Server error: Could not create uploads directory");
    }
  }
  next();
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the full path here
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Test API endpoint
router.get("/test", (req, res) => {
  res.json({ message: "This is a test route from the backend!" });
});

// Detect objects endpoint - apply the middleware before file upload
router.post(
  "/detect-objects",
  ensureUploadsDirExists,
  upload.single("image"),
  (req, res) => {
    const imagePath = path.resolve(req.file.path);

    // Rest of your code remains the same
    const python = spawn("python", [
      path.resolve("../ai-models/yolov11/yolov11_model.py"),
      imagePath,
    ]);

    let dataToSend = "";

    python.stdout.on("data", (data) => {
      dataToSend += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`❌ Python script error: ${data}`);
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ Python script exited with code ${code}`);
        return res.status(500).send(`Python script exited with code ${code}`);
      }
      try {
        console.log("💡 Raw data from Python:", dataToSend);

        // ✅ Extract JSON using regex (matches everything between the first '{' and last '}')
        const jsonMatch = dataToSend.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          console.error("❌ No valid JSON found in Python output.");
          return res.status(500).send("No valid JSON found in Python output.");
        }

        const jsonOutput = jsonMatch[0];
        console.log("💡 Extracted JSON part:", jsonOutput);

        const parsedData = JSON.parse(jsonOutput);
        res.json(parsedData);
        console.log("✅ Final JSON sent:", parsedData);
      } catch (error) {
        console.error(`❌ JSON Parsing Error: ${error.message}`);
        res.status(500).send(`Error parsing JSON: ${error.message}`);
      }
    });
  }
);

module.exports = router;
