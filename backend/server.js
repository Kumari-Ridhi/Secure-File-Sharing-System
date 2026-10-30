const auth = require("./middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const fs = require("fs");
const File = require("./models/File");
const express = require("express");
const mongoose =require("mongoose");
require("dotenv").config();

const multer = require("multer");
const path = require("path");

const app = express();
const cors = require("cors");
app.use(cors());
const PORT = process.env.PORT || 3000;

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

console.log("Uploads directory ready:", uploadDir);

app.use(express.json());

// Configure where uploaded files will be stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain"
];

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Only JPG, PNG, PDF, and TXT files are allowed."
                )
            );
        }
    }
});

app.get("/",(req, res)=>{
  res.send("Secure File Sharing System Backend is running!");
});

app.post("/upload", auth, (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) {
            const isUploadError = err instanceof multer.MulterError;

            return res.status(isUploadError ? 400 : 415).json({
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file to upload."
            });
        }

        try {
            const newFile = await File.create({
                originalName: req.file.originalname,
                storedName: req.file.filename,
                owner: req.userId,
                storagePath: req.file.path,
                size: req.file.size
            });

            return res.status(201).json({
                message: "File uploaded successfully!",
                file: newFile
            });
        } catch (error) {
            console.error("Upload error:", error.message);

            return res.status(500).json({
                message: "File upload failed."
            });
        }
    });
});

app.get("/files", auth, async (req, res) => {
    try {
        const files = await File.find({ owner: req.userId })
           .select("originalName storedName size createdAt")
            .sort({ _id: -1 });

        res.status(200).json({
            count: files.length,
            files: files
        });
    } catch (error) {
        console.error("Fetch files error:", error.message);

        res.status(500).json({
            message: "Failed to retrieve files."
        });
    }
});

app.get("/download/:id", auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        res.download(file.storagePath, file.originalName, (error) => {
            if (error && !res.headersSent) {
                res.status(500).json({
                    message: "Could not download file."
                });
            }
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid file ID."
        });
    }
});


app.delete("/files/:id", auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        // Delete the physical file if it exists
        if (fs.existsSync(file.storagePath)) {
            fs.unlinkSync(file.storagePath);
        }

        // Delete the file record from MongoDB
        await File.deleteOne({ _id: file._id });

        res.status(200).json({
            message: "File deleted successfully."
        });
    } catch (error) {
        console.error("Delete error:", error.message);

        res.status(400).json({
            message: "Could not delete file."
        });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Registration failed."
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

async function startServer(){
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, ()=>{
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch(error){
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();