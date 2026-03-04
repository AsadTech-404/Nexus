import Document from "../models/document.model.js";
import { uploadFile } from "../storage.service.js";

// Upload document
export const uploadDocument = async (req, res) => {
    try {
        const { name, size, shared } = req.body;
        const ownerId = req.user.id;
        const file = req.file

        const result = await uploadFile(file.buffer.toString("base64"))

        const newDocument = new Document({
            ownerId,
            name: name || file.originalname,
            type: file.mimetype.split("/")[1].toUpperCase(),
            size,
            document: result.url,
            shared: shared || false,
            lastModified: new Date().toISOString(),
        });

        await newDocument.save();

        return res.status(201).json({ success: true, message: "Document uploaded successfully", document: newDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get all document for current user
export const getDocuments = async (req, res) => {
    try {
        const ownerId = req.user.id;

        if(!ownerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const documents = await Document.find({ ownerId }).sort({ lastModified: -1 });
        return res.status(200).json({ success: true, documents });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Toggle Document sharing
export const toggleDocumentSharing = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if(!ownerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const document = await Document.findOne({ _id: id, ownerId });
        if(!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        document.shared = !document.shared;
        await document.save();

        return res.status(200).json({ success: true, message: "Document shared successfully", document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete document
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if(!ownerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const document = await Document.findOneAndDelete({ _id: id, ownerId });
        if(!document) {
             return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};