const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },
        storedName: {
            type: String,
            required: true,
            unique: true
        },
        owner: {
            type: String,
            required: true
        },
        storagePath: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("File", fileSchema);