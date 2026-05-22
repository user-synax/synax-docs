import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "Untitled Document",
    },
    ownerId: {
        type: String,
        required: true,
        index: true,
    },
    content: {
        type: Object,
        default: {},
    },
    collaborators: [
        {
            userId: String,
            role: {
                type: String,
                enum: ["viewer", "editor"],
            },
        },
    ],
    shareMode: {
        type: String,
        enum: ["private", "public-view", "public-edit"],
        default: "private",
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    lastEditedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Add compound index on ownerId + deletedAt
DocumentSchema.index({ ownerId: 1, deletedAt: 1 });

// Add text index on title for search
DocumentSchema.index({ title: "text" });

const Document =
    mongoose.models.Document || mongoose.model("Document", DocumentSchema);

export default Document;
