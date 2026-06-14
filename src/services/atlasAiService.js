import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Atlas AI Service for data extraction
 *
 * MIGRATED: Now securely calls the Firebase Cloud Function
 * 'parsePriceListImage' to avoid exposing the GEMINI_API_KEY on the frontend.
 */

/**
 * Converts a JS File object into a base64 string
 * @param {File} file 
 * @returns {Promise<{imageBase64: string, mimeType: string}>}
 */
const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // result is like "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            const base64Data = reader.result;
            resolve({
                imageBase64: base64Data,
                mimeType: file.type
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Extracts API Peptides (Name and Price/g) from an image table securely via backend.
 * @param {File} imageFile 
 * @param {string} [instructions] Optional custom instructions
 * @returns {Promise<Array>} Array of { peptideName, pricePerGram } and other items
 */
export const extractApiPeptidesFromImage = async (imageFile, instructions = '') => {
    try {
        const { imageBase64, mimeType } = await fileToBase64(imageFile);

        const parsePriceListImage = httpsCallable(functions, 'parsePriceListImage');
        
        const response = await parsePriceListImage({
            imageBase64,
            mimeType,
            instructions: instructions || "Focus on extracting API Peptides with their base price per gram. Ignore quantity/total columns."
        });

        const data = response.data;
        if (!data.success) {
            throw new Error(data.error || 'Backend extraction failed');
        }

        // The Cloud Function returns: { success: true, global_discount_percentage, items: [...] }
        // We map it to the expected structure if needed, or just return the items.
        // For backwards compatibility with older usages of this service:
        const mappedData = (data.items || []).map(item => ({
            peptideName: item.peptide_name || item.original_text || 'Unknown',
            pricePerGram: item.unit_price || 0,
            originalItem: item
        }));

        return mappedData;

    } catch (error) {
        console.error("Atlas AI Backend Extraction failed:", error);
        throw new Error("Failed to process image with Atlas AI on the backend. Ensure the image is clear.");
    }
};
