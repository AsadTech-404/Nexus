import express from "express";
import multer from "multer";
import { deleteDocument, getDocuments, toggleDocumentSharing, uploadDocument } from "../controller/document.controller.js";
import { authenticate } from './../middleware/auth.middleware.js';

const documentRoute = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Test route
documentRoute.get("/", (req, res) => {
    res.json({ message: "Document route is working!" });
});

documentRoute.post("/upload", upload.single("document"), authenticate, uploadDocument);
documentRoute.get("/documents", authenticate, getDocuments);
documentRoute.put("/:id/share", authenticate, toggleDocumentSharing);
documentRoute.delete("/:id", authenticate, deleteDocument);

export default documentRoute;