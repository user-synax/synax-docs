import mongoose from "mongoose";

const VersionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true,
    },
    content: {
        type: Object,
        required: true,
    },
    savedBy: {
        type: String, // Clerk user ID
        required: true,
    },
    label: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

VersionSchema.index({ documentId: 1, createdAt: -1 });

const Version =
    mongoose.models.Version || mongoose.model("Version", VersionSchema);

export default Version;
