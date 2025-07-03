require("dotenv").config();
const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const sharp = require("sharp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;

// Multer with file size limit (5MB)
const upload = multer({
  dest: "upload/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.use(express.static("public"));

// Analyse route
app.post("/analyse", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  const imagePath = req.file.path;

  try {
    const imageData = await fsPromises.readFile(imagePath, { encoding: "base64" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Analyze this plant image and provide detailed analysis of its species, health, and care recommendations, its characteristics, care instructions, and any interesting facts. Please provide the response in plain text without using any markdown formatting.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const plantInfo = result.response.text();

    await fsPromises.unlink(imagePath); // cleanup uploaded file

    res.json({
      result: plantInfo,
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (error) {
    console.error("❌ Error analyzing image:", error);
    await fsPromises.unlink(imagePath);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Error processing image. Try again later."
          : error.message,
    });
  }
});

// Download route
app.post("/download", express.json(), async (req, res) => {
  const { result, image } = req.body;
  const reportsDir = path.join(__dirname, "reports");
  await fsPromises.mkdir(reportsDir, { recursive: true });

  const filename = `plant_analysis_report_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, filename);
  const writeStream = fs.createWriteStream(filePath);
  const doc = new PDFDocument();
  doc.pipe(writeStream);

  try {
    doc.fontSize(24).text("Plant Analysis Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.fontSize(14).text(
      result.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '•'),
      { align: "left" }
    );

    doc.moveDown(2);
    let tempImagePath = null;

    if (image) {
      const match = image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
      if (!match) throw new Error("Invalid base64 image format");
      const buffer = Buffer.from(match[2], "base64");
      const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
      tempImagePath = path.join(__dirname, `temp-debug-${uniqueId}.jpg`);

      await sharp(buffer).jpeg().toFile(tempImagePath);

      doc.image(tempImagePath, { fit: [500, 300], align: "center", valign: "center" });
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", async () => {
        if (tempImagePath) {
          try {
            await fsPromises.unlink(tempImagePath);
            console.log("🗑️ Temp image deleted");
          } catch (e) {
            console.error("❌ Temp image delete failed", e);
          }
        }
        resolve();
      });
      writeStream.on("error", reject);
    });

    res.download(filePath, async (err) => {
      if (err) {
        console.error("❌ Error sending file:", err);
        return res.status(500).json({ error: "Failed to send PDF" });
      }
      try {
        await fsPromises.unlink(filePath);
        console.log("🗑️ PDF deleted:", filePath);
      } catch (e) {
        console.error("❌ Failed to delete PDF", e);
      }
    });
  } catch (error) {
    console.error("❌ PDF Generation Failed:", error);
    res.status(500).json({ error: "Could not generate PDF" });
  }
});




// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
