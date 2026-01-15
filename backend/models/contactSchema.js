import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: String,
    // Change these to Arrays to support multiple numbers/emails
    emails: [String], 
    phones: [String], 
    // Metadata for your "Human-in-the-loop" improvement
    confidenceScore: { type: Number, default: 0 }, 
    isVerified: { type: Boolean, default: false }, // Did a human check this?
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema);
export default Contact;