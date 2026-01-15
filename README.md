# 📇 VizCard – AI Business Card Digitizer

**VizCard** is a full-stack **MERN application** that digitizes physical business cards using **Optical Character Recognition (OCR)**.

Unlike simple OCR tools, VizCard follows a **Human-in-the-Loop** workflow — users can verify AI suggestions, edit detected text, and manage multiple contacts efficiently.

---

## 🚀 Key Features

- 🔍 **AI-Powered OCR**  
  Uses `Tesseract.js` to extract text from images **locally** (no external APIs required).

- 🧠 **Intelligent Parsing**  
  Automatically detects **emails** and **phone numbers** using Regex patterns.

- 📊 **Confidence Scoring**  
  Visual confidence badges (**Green / Orange / Red**) indicate OCR reliability.

- 🖱️ **Click-to-Fill Interface**  
  Click extracted text fragments to auto-fill contact form fields.

- 📂 **CSV Export**  
  Export saved contacts as `.csv` for Excel or CRM tools.

- 📱 **Multi-Field Support**  
  Supports **multiple phone numbers and emails** per card.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- CSS3 (Dark Mode)

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### OCR Engine
- Tesseract.js

### File Handling
- Multer

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB installed locally or via MongoDB Atlas

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/vizcard.git
cd vizcard
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vizcard
```

Create uploads folder (if not present):
```bash
mkdir uploads
```

Run the backend server:
```bash
node index.js
```

---

### 3️⃣ Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📖 Usage Guide

1. **Upload**  
   Click `Choose File` and select a business card image.

2. **Scan**  
   Click `Scan Card` to run OCR.

3. **Verify**  
   - **Left Panel:** Auto-filled form with confidence badges
     - 🟢 Green → High confidence
     - 🟠 Orange → Medium confidence
     - 🔴 Red → Low confidence
   - **Right Panel:** Suggestions panel  
     Click text to fill missing fields (Name, Company, etc.)

4. **Save**  
   Click `Save Contact` to store data.

5. **Export**  
   Click `Export CSV` to download contacts.

---

## 📡 API Endpoints

| Method | Endpoint           | Description                                      |
|--------|-------------------|--------------------------------------------------|
| POST   | `/api/card/scan`  | Uploads image, runs OCR, returns structured data |
| POST   | `/api/card/save`  | Saves verified contact details                   |
| GET    | `/api/card/export`| Downloads contacts as CSV                        |

---

## 🧠 How It Works

1. Image upload via **Multer**
2. OCR with **Tesseract.js**
3. **Regex + layout heuristics** for data extraction
4. **Confidence scoring** (0–100)
5. **Temporary image cleanup** for privacy

---

## 🔮 Future Improvements

- User authentication
- Cloudinary integration
- VCard (`.vcf`) export

---

## 🤝 Contributing

Fork the repo, create a branch, and submit a PR.

---

## 👤 Author

**Sumant Khalatkar**  
TE Information Technology Student @ PICT

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
