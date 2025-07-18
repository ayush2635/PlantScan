# 🌿 PlantScan

![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-✔️-green)
![Express](https://img.shields.io/badge/Express-✔️-lightgrey)

---

## 📖 Overview
PlantScan is a modern, AI-powered web application that analyzes images of plants and generates detailed reports on their species, health status, care recommendations, and interesting facts. The app leverages Google Gemini (Gemini-1.5-Flash) for generative AI analysis, `sharp` for image processing, and `pdfkit` for downloadable PDF reports.

---

## ✨ Features

- 📸 **Image Upload**: Upload plant photos (max 5MB) via a simple form.  
- 🤖 **AI Analysis**: Uses Google Generative AI (Gemini) to identify species, assess health, and suggest care tips.  
- 📄 **PDF Reports**: Download a beautifully formatted PDF report including analysis and image.  
- 🗑️ **Auto Cleanup**: Uploaded and temporary files are automatically cleaned up.  
- ⚙️ **Environment Config**: Easy setup with environment variables.  

---

## 🛠️ Technologies

- **Node.js** & **Express**: Backend server and API routing.  
- **Google Generative AI**: `@google/generative-ai` package for plant analysis.  
- **Multer**: File upload handling with size limits.  
- **Sharp**: High-performance image processing.  
- **PDFKit**: Dynamic PDF generation.  
- **dotenv**: Environment variable management.  

---

## 🚀 Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/ayush2635/PlantScan.git
   cd PlantScan
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Create a `.env` file** at the project root:  
   ```env
   PORT=5000
   GEMINI_API_KEY=your_google_gemini_api_key
   NODE_ENV=development
   ```

4. **Run the app**  
   ```bash
   npm start
   ```

5. **Open** `http://localhost:5000` in your browser.

