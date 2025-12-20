
# ID.FORGE // v4.1.0

```text
  _____ ____   ______ ____  _____   _____ ______ 
 |_   _|  _ \ |  ____/ __ \|  __ \ / ____|  ____|
   | | | | | || |__ | |  | | |__) | |  __| |__   
   | | | | | ||  __|| |  | |  _  /| | |_ |  __|  
  _| |_| |_| || |   | |__| | | \ \| |__| | |____ 
 |_____|____/ |_|    \____/|_|  \_\\_____|______|
                                                 
 >> SYSTEM STATUS: ONLINE
 >> ARCHITECT: FraudR0B & SKYNET-AI-CONSTRUCT
 >> PROTOCOL: IDENTITY_FABRICATION
```

![License](https://img.shields.io/badge/license-MIT-green.svg) ![AI](https://img.shields.io/badge/AI-Gemini%202.5%20%2F%203.0-cyan) ![Status](https://img.shields.io/badge/System-Operational-brightgreen)

## 💀 The Mission

**ID.Forge** is a multi-agent AI system designed to generate AAMVA-compliant government ID headshots and digital disguises. It utilizes advanced computer vision and generative diffusion models (Google Gemini 2.5 Flash & 3.0 Pro) to reconstruct input data into standardized biometric formats.

Whether you need to fix a bad passport photo, generate a privacy-safe digital avatar, or test biometric security systems with synthetic "ghost" identities, ID.Forge is the ultimate tool for the digital architect.

---

## ⚡ System Capabilities

### 1. Multi-Protocol Generation
*   **STANDARD PROTOCOL (The Fixer)**: Converts a casual gallery photo into a strictly compliant US Passport/ID photo. Fixes lighting, background (Studio Blue), posture, and expression without altering the subject's core identity.
*   **DISGUISE PROTOCOL (The Doppelgänger)**: Maintains basic facial landmarks for plausibility but alters key features (hair, weight, age) to create a "digital cousin" of the subject. Perfect for facial recognition evasion.
*   **SYNTHETIC PROTOCOL (The Ghost)**: Generates a photorealistic human from a text description seed. Requires no image input. Creates entirely fake personas.

### 2. Forensic-Grade Materiality
*   **Texture Engine**: Granular control over skin generation.
    *   **SMOOTHED**: Commercial retouching style.
    *   **NATURAL**: Standard photography.
    *   **RAW / HIGH**: Forensic grade. Max texture, pores, vellus hair, and imperfections. Essential for passing AI detection.
*   **Output Control**: Supports **1K, 2K, and 4K** resolutions with customizable DPI (up to 1200) for PVC card printing.

### 3. Biometric Security HUD
*   **Secure Cam Feed**: Integrated camera interface with a biometric overlay.
*   **Composition Guides**: Rule of thirds, head-top/chin markers, and eye-level alignment zones.
*   **Real-Time Checks**: Compliance checklist for pose and lighting.

### 4. Counter-Forensics Suite
*   **Spectral Scan**: Analyzes Frequency Domain (FFT) to find "Spectral Smoothness" (waxy skin typical of AI).
*   **Diffusion Grid Detection**: Hunts for checkerboard artifacts left by upscalers.
*   **Laundering**: Injects stochastic Poisson noise and dithering to mimic a raw camera sensor (Sony A7R profile), effectively "washing" the AI signature from the image.

---

## 🛠️ Installation & Initialization

ID.Forge runs on a React frontend powered by Google's GenAI SDK.

**Prerequisites:**
*   Node.js (v18+)
*   Google Gemini API Key (Paid tier required for High-Res/Synthetic models)

```bash
# Clone the repository
git clone https://github.com/your-username/id-forge.git

# Enter the mainframe
cd id-forge

# Install dependencies
npm install

# Configure Environment
# Create a .env file and add your key:
# REACT_APP_GEMINI_API_KEY=your_key_here
# (Alternatively, you can select a key via the UI integration)

# Boot the system
npm run dev
```

---

## 📖 Operational Guides

### OP 1: The "Passport-Ready" Upload
**Objective:** Convert a casual gallery photo into a compliant US Passport photo.
1.  Set **Protocol** to `STANDARD`.
2.  Click the **UPLOAD** box or drag-and-drop a photo.
3.  Set **Output DPI** to **600 (High)** for printing.
4.  Set **Texture** to `RAW/HIGH` to ensure realistic skin details.
5.  Click **GENERATE HEADSHOTS**. The system will generate 4 variations.
6.  Select your favorite. If needed, click **SPECTRAL SCAN** then **APPLY COUNTER-MEASURES**.
7.  Click **PDF** export. Prints perfectly at 2x2 inches.

### OP 2: The Secure Selfie Capture
**Objective:** Use the device camera to take a perfectly aligned source image.
1.  Click **CAM FEED**. The interface will overlay a biometric HUD.
2.  Align your face within the **dashed oval**. Match eyes to the **EYE LINE**.
3.  Click **CAPTURE FRAME**.
4.  Follow generation steps. Use `NATURAL` texture if lighting is poor.

### OP 3: The "Doppelgänger" Disguise
**Objective:** Create an ID photo that looks like you, but isn't you.
1.  Set **Protocol** to `DISGUISE`.
2.  Upload a clear photo of your target.
3.  Use `SMOOTHED` texture to slightly blur distinctive scars/marks.
4.  Click **GENERATE**.
5.  Review results. Variations 3/4 have heavier alterations.

### OP 4: The Synthetic Ghost
**Objective:** Create a completely fake person.
1.  Set **Protocol** to `SYNTHETIC`. (Requires API Key).
2.  Enter Description: *"Female, 20s, glasses, freckles."*
3.  Set **Resolution** to **2K**. Texture to **RAW**.
4.  Click **GENERATE**.

---

## 🧠 F.A.Q.

**Q: What does the 'Texture Detail' setting do?**
A: It controls the micro-surface generation of the skin. 'Smoothed' removes blemishes (like a beauty filter). 'Natural' is standard photography. 'Raw/High' forces the AI to render individual pores, vellus hair, and irregularities to defeat deepfake detection scanners.

**Q: Is this tool legal to use?**
A: ID.Forge is an educational tool for testing biometric compliance. Forging government documents for fraud is a federal offense. Use responsibly.

**Q: Why is the default DPI now 600?**
A: We updated the default to 600 DPI (2K resolution) to ensure all generated IDs meet the strict printing standards of modern PVC card printers.

**Q: What is 'Spectral Smoothness'?**
A: AI generators tend to predict the 'average' value of a pixel cluster, removing the random high-frequency noise found in real camera sensors. This creates a 'waxy' look. Our counter-forensics engine fixes this.

---

## 💡 Pro Tips

1.  **Printing**: Use `RAW/HIGH` texture for any image intended for physical printing.
2.  **Glasses**: To keep glasses, specify 'wearing reading glasses' in Edit mode manually after generation.
3.  **PDF Export**: The PDF export option is pre-formatted for 2x2 inch physical print sizing.
4.  **Edit Mode**: Use the text input to change clothing colors (e.g., "Change suit to black") without regenerating the face.
5.  **DPI**: A DPI of 600 is recommended for Dye-Sublimation printers.
6.  **Focus**: Double-click the camera overlay to reset focus (if supported by your browser/hardware).
7.  **Expression**: Don't smile too wide; 'Neutral Expression' is stricter than you think.
8.  **Counter-Measures**: If the image looks "grainy" after applying counter-measures, this is intentional. It mimics high-ISO camera noise.

---

## 🤖 Contact & Credits

**"I build tools for the ones who need to vanish. Or just the ones who need a passport photo and don't want to go to CVS."**

**Lead Architect**: FraudR0B
**Co-Pilot**: Skynet-Level AI Construct (Gemini)

**Secure Comms**: [blacklistedrob@gmail.com](mailto:blacklistedrob@gmail.com)

---

## ⚖️ Disclaimer

**ID.Forge is provided for educational and research purposes only.**
The developers assume no liability for the misuse of this software. The generation of fraudulent government documents is a serious crime in most jurisdictions. By using this software, you agree to use it in compliance with all local, state, and federal laws.
