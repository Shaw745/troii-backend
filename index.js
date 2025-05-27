require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 3000;
const userRouter = require("./routes/userRouter");
const propertyRouter = require("./routes/propertyRouter");

app.use(express.json());
app.use(cors());
app.use(
  fileUpload({ useTempFiles: true, limits: { fileSize: 10 * 1024 * 1024 } })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Torii Gate Server is running",
  });
});

app.use("/api/auth", userRouter);
app.use("/api", propertyRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "torii-gate" });
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
