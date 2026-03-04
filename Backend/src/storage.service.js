import ImageKit from "@imagekit/nodejs";
import "dotenv/config";

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_KEY
});

export const uploadFile = async (file) => {
    try {
        const result = await imagekit.files.upload({
            file,
            fileName: `document-${Date.now()}`,
            folder: "/documents"
        });
        return result;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};