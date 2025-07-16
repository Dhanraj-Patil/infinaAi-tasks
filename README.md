# Infina AI Task Submission

This repository contains solutions to two technical problems as part of the Infina AI tasks.

---

## 📁 `task-2/`

### 🎯 Problem 2 – Parallel Audio Stream Separation (Browser)

**Goal:**  
Simultaneously capture **system audio** (via screen capture) and **microphone audio** in Chrome. The main challenge is that system audio often bleeds into the mic input, causing echo or overlap. The task is to separate the two audio streams cleanly using real-time signal processing.

### 📂 Subprojects:

- **`rnnoise/`** – WebAssembly-based real-time voice denoising using RNNoise (deep learning).
- **`abstract-filtering-lms/`** – Adaptive noise cancellation using LMS (Least Mean Squares) filtering — a DSP-based approach.

---

### 🔍 Approach & Insights

- **Root Cause:** When capturing audio from both the mic and system, the microphone picks up environmental sounds *including* the system's output, resulting in echo or overlapping signals.
- **RNNoise**:
  - A deep learning-based noise suppression model.
  - Buffers **128-frame chunks**, totaling **480 samples (10ms at 48kHz)** before processing.
  - Designed to target background/system noise while preserving human speech.
  - Used in popular tools like **OBS Studio** and **Jitsi Meet**.
- **LMS Filtering**:
  - A classical DSP technique for **adaptive noise cancellation**.
  - Learns the echo pattern in real-time and attempts to subtract it from the mic signal.

> ✅ **Best Results**: Combining **RNNoise** with **LMS filtering** can yield more effective separation. RNNoise removes background/system noise, while LMS specifically targets time-aligned echoes and interference patterns. Together, they form a hybrid solution.

#### ▶️ How to Run:
  -**RNNoise**
  ```bash
  cd task-2/rnnoise-ns
  python -m http.server 8080
  ```
  Then open http://localhost:8080 in your browser.
  Or simply open the index.html file directly in Chrome.

  -**LMS Filtering**
  ```bash
  cd task-2/adaptive-filtering-LMS
  python ./main.py
  ```
  After execution, the cleaned audio output will be saved in the same directory.
  
  ---

### 📘 References

- [Xiph RNNoise (C)](https://github.com/xiph/rnnoise)
- [Jitsi RNNoise WASM](https://github.com/jitsi/rnnoise-wasm)
- [Jitsi Stream Effects](https://github.com/jitsi/jitsi-meet/tree/master/react/features/stream-effects)
- [RNNoise Demo](https://jmvalin.ca/demo/rnnoise/)
- [Audio Processing in Python – Medium](https://medium.com/@mateus.d.assis.silva/processing-audio-with-python-b6ec37ac2f40)
- [DSP Audio Concepts – Headphonesty](https://www.headphonesty.com/2022/01/dsp-audio)
- etc

---

## 📁 `task-3/google-calendar-app/`

### 🎯 Problem 3 – Google Calendar Integration Without WebSockets or BaaS

A **frontend-only React application** that:

- Uses **Google Identity Services (GIS)** for OAuth2 authentication
- Fetches and displays a user’s Google Calendar events via **GAPI**
- Polls Google Calendar API every **30 seconds** to detect updates
- Fully client-side — no WebSocket or backend dependency
- https://infina-ai-tasks.vercel.app/

The app does **not yet use `syncToken`**, but is structured to support it in future to allow more efficient and incremental sync.

#### ▶️ How to Run:
  -**Google Calendar App**
  ```bash
  cd task-3/google-calendar-app
  ```
  Create a .env file and add VITE_CLIENT_ID and VITE_API_KEY into the .env file.
  ```bash
  npm install
  npm run dev
  ```

