import express from 'express';
import upload from '../middlewares/upload.js';
import { scanCard, saveContact, exportContacts } from '../controllers/cardController.js';

const router = express.Router();

// POST /api/card/scan
router.post('/scan', upload.single('cardImage'), scanCard);

router.post('/save', saveContact);

router.get('/export', exportContacts);

export default router;

