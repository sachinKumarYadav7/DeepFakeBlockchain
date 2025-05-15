# 🛡️ Decentralized Video Verification System Using Blockchain to Detect and Prevent Deepfake Media

A robust blockchain-based media verification system that leverages AI and smart contracts to detect, prevent, and flag deepfake videos/images during upload. It ensures content authenticity, user accountability, and ethical media sharing.

---

## 🔍 Project Overview

This project is built as a **final-year B.Tech project** at IIT Dharwad. It aims to combine AI-based media forensics with blockchain immutability to stop deepfakes at the source. The system handles:

- Video and image uploads via a decentralized React + MetaMask frontend
- Deep analysis using perceptual hashing, DCT, Histogram, and AI feature extraction
- Real-time comparison with previously stored hashes and features on blockchain
- Smart contracts that log attempts, grant reuse permission, and maintain reputation

---

## 🧠 Core Components

### 🔐 Smart Contracts (Solidity)
- Store metadata of genuine uploads
- Flag deepfakes and deduct user trust score
- Allow permission-based reuse
- Keep a track of all genuine/deepfake attempts

### 🧪 Backend (Python Flask)
- Extract video frames using OpenCV
- Compute frame-wise: 
  - **Perceptual Hash (pHash)**
  - **DCT Hash**
  - **Histogram Hash**
  - **ResNet50 Deep Features**
- Compare with on-chain values and classify video as:
  - ✅ Genuine
  - 🚫 Deepfake
  - 🔁 Duplicate

### 💻 Frontend (React + MetaMask)
- User login via wallet
- Upload panel for media
- Smart contract interaction
- Feed showing only genuine verified videos

---

## 🚀 How to Run

### Prerequisites
- Python 3.9+
- Node.js & npm
- MetaMask installed on browser
- Ganache or `npx hardhat node` running

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py


### Smart Contract Setup

npm install --save-dev hardhat
npx hardhat compile
npx hardhat node         # Start local Ethereum node
npx hardhat run scripts/deploy.js --network localhost


### Frontend Setup

cd frontend
npm install
npm i
npm dev run

### backend Setup


python app.py

