import Tesseract from 'tesseract.js';
import fs from 'fs';
import Contact from '../models/contactSchema.js';

// --- Helper: Calculate Confidence ---
const calculateConfidence = (lines) => {
    if (!lines || lines.length === 0) return 0;
    // Safety check: ensure 'confidence' property exists, default to 70 if missing
    const totalConf = lines.reduce((acc, line) => acc + (line.confidence || 70), 0);
    return Math.round(totalConf / lines.length);
};

// --- Helper: Parse Layout (Font Size) ---
const getLineHeight = (bbox) => {
    if (!bbox) return 0; 
    return bbox.y1 - bbox.y0;
};

export const scanCard = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const imagePath = req.file.path;

    console.log("📸 Scanning image...");

    // 1. Run Tesseract
    const result = await Tesseract.recognize(imagePath, 'eng');
    const data = result.data || {};
    const lines = data.lines || [];
    const fullText = data.text || "";

    // CLEANUP
    fs.unlinkSync(imagePath);

    console.log("📝 Raw OCR Text found:\n", fullText); // DEBUG: Check this in your terminal!

    // 2. Regex Extraction (Run on full text for best results)
    // Updated Regex to be a bit more flexible with spaces
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;

    const emailMatches = fullText.match(emailRegex) || [];
    const phoneMatches = fullText.match(phoneRegex) || [];

    // 3. Line Analysis
    let potentialNames = [];
    let potentialCompanies = [];
    
    // Keywords to identify companies
    const companyKeywords = ['Inc', 'Ltd', 'Pvt', 'Group', 'Corp', 'Systems', 'Solutions', 'Enterprises', 'Technologies', 'Services'];

    // Calculate max font size to find the "Main Heading" (Name/Company)
    const heights = lines.map(l => getLineHeight(l.bbox));
    const maxLineHeight = heights.length > 0 ? Math.max(...heights) : 0;

    lines.forEach(line => {
        const text = line.text ? line.text.trim() : "";
        
        // Filter out garbage (too short, or just symbols)
        if (text.length < 3) return;
        if (!/[a-zA-Z]/.test(text)) return; // Must have at least one letter

        // Skip if this line is JUST an email or phone (we already caught those)
        if (emailMatches.some(e => text.includes(e))) return;
        if (phoneMatches.some(p => text.includes(p))) return;

        // CLASSIFICATION LOGIC
        const height = getLineHeight(line.bbox);
        
        // 1. Is it a Company?
        if (companyKeywords.some(k => text.includes(k))) {
            potentialCompanies.push({ text, confidence: line.confidence });
        }
        // 2. Is it Big Text? (Likely Name or Company)
        else if (maxLineHeight > 0 && height > maxLineHeight * 0.8) {
             // If we already have a company, this might be the name
             potentialNames.push({ text, confidence: line.confidence });
        }
        // 3. Fallback: Add to Name suggestions so user can pick
        else {
            potentialNames.push({ text, confidence: line.confidence || 50 });
        }
    });

    // FAIL-SAFE: If "lines" analysis failed (empty arrays), use raw text splitting
    if (potentialNames.length === 0 && potentialCompanies.length === 0) {
        console.log("⚠️ Smart analysis failed. Switching to simple fallback.");
        const rawLines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        potentialNames = rawLines.map(l => ({ text: l, confidence: 0 }));
    }

    // 4. Send Response
    res.json({
        success: true,
        data: {
            emails: {
                values: emailMatches,
                confidence: emailMatches.length > 0 ? 98 : 0
            },
            phones: {
                values: phoneMatches,
                confidence: phoneMatches.length > 0 ? 96 : 0
            },
            names: {
                values: potentialNames.map(n => n.text),
                confidence: calculateConfidence(potentialNames)
            },
            companies: {
                values: potentialCompanies.map(c => c.text),
                confidence: calculateConfidence(potentialCompanies)
            }
        }
    });

  } catch (error) {
    console.error("❌ Error in scanCard:", error);
    res.status(500).json({ error: error.message });
  }
};

export const saveContact = async (req, res) => {
    // ... (Use the previous saveContact code)
    try {
        const { name, emails, phones, company } = req.body;
        const newContact = new Contact({ name, emails, phones, company, isVerified: true, confidenceScore: 100 });
        await newContact.save();
        res.status(201).json({ message: "Contact Saved!", contact: newContact });
    } catch (error) {
        res.status(500).json({ error: "Database Save Failed" });
    }
};

// ... (Keep the exportContacts code)
// Remove the 'import { Parser } from json2csv' line at the top if you have it.

export const exportContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });

        if (!contacts || contacts.length === 0) {
            return res.status(404).send("No contacts found to export.");
        }

        // 1. Define CSV Headers
        let csvString = "Name,Company,Emails,Phones,Created At\n";

        // 2. Loop through data and build string
        contacts.forEach(contact => {
            // Helper: Wrap field in quotes "..." to handle commas inside names
            // Join arrays with ' | ' separator
            const name = `"${contact.name || ''}"`;
            const company = `"${contact.company || ''}"`;
            const emails = `"${(contact.emails || []).join(' | ')}"`;
            const phones = `"${(contact.phones || []).join(' | ')}"`;
            const date = `"${new Date(contact.createdAt).toLocaleDateString()}"`;

            // Append row
            csvString += `${name},${company},${emails},${phones},${date}\n`;
        });

        // 3. Set Headers to force download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="my_contacts.csv"');

        // 4. Send the string
        res.status(200).send(csvString);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).send("Server Error during Export");
    }
};