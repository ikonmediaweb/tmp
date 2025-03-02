const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const uploadDir = path.join(__dirname, '..', 'upload');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filePath: req.file.filename });
});

// Serve static files from the upload directory
app.use('/uploads', express.static(uploadDir));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});