const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON request bodies

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const apiRoutes = require("./routes/apiRoutes");

app.use("/api", apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
