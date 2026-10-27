# Open Video Studio 🎬
> **State-of-the-Art Open-Source AI Video Generation SaaS Frontend**  
> Inspired by modern cinematic generative video studios. Built with React, Vite, TypeScript, and Tailwind CSS. Deployable to GitHub Pages at **₹0 total cost**.

![Open Video Studio Banner](https://img.shields.io/badge/Open%20Video%20Studio-v1.0.0-amber?style=for-the-badge&logo=film)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)
![Models](https://img.shields.io/badge/Models-Wan2.1%20%7C%20LTX--Video%20%7C%20CogVideoX-cyan?style=for-the-badge)
![Budget](https://img.shields.io/badge/Budget-%E2%82%B90%20Zero%20Cost-violet?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-33%20Passing-brightgreen?style=for-the-badge)

---

## 🌟 Key Highlights

- **✨ 100% Free & Zero-Cost Architecture**: Zero mandatory paid API keys, zero cloud database costs, zero subscription tiers.
- **🎬 Text-to-Video Studio**: Full prompt engineering workspace with negative prompts, aspect ratio framing (16:9, 9:16, 1:1, 4:3, 21:9), resolution controls, inference step sliders, and CFG guidance.
- **🖼️ Image-to-Video Studio**: Drag-and-drop keyframe upload, client-side format & size validation (JPEG, PNG, WebP ≤ 10MB), motion prompt input, motion intensity sliders, and 6 camera trajectories (*Push In, Pull Back, Pan Left/Right, Orbit, Static*).
- **🚀 Verified Open Foundation Models**: Native registry support for **Wan2.1 (1.3B & 14B)**, **LTX-Video 0.9.1**, and **CogVideoX-5B** with parameter specs, VRAM footprints, and Apache 2.0 / OpenRAIL license transparency.
- **🎮 Built-In Demo Engine**: Works completely offline without an external GPU or token. Generates genuine playable WebM/MP4 video streams in-browser via canvas procedural synthesis with simulated GPU scheduler logs.
- **🌐 Real Inference Adapters**: 
  - **Hugging Face Gradio Spaces**: Verified direct connection to Hugging Face ZeroGPU queue API over Server-Sent Events (SSE) with cold start and rate-limit detection.
  - **Custom / ComfyUI Local Workstation**: Direct HTTP webhook connection to your own workstation GPU running ComfyUI on `http://127.0.0.1:8188`.
- **📼 Cinematic HTML5 Player**: Custom controls with scrub bar, variable playback speed (*0.5x, 1x, 1.5x, 2x*), loop playback toggle, fullscreen, prompt copying, settings reuse, and one-click MP4 downloading.
- **💾 Local Storage Gallery**: Persistent browser history management with JSON export & import, search filtering, tag categorization, favorite pinning, and automatic memory cleanup.
- **📦 GitHub Pages Ready**: Configured with relative base asset paths, client-side hash routing, `404.html` SPA redirection fallback, and an automated GitHub Actions deployment workflow.

---

## 🏗️ Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │          Open Video Studio Frontend           │
                      │        (React 18 + Vite + Tailwind CSS)       │
                      └──────────────────────┬────────────────────────┘
                                             │
                                     Provider Switcher
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
             ▼                               ▼                               ▼
    ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
    │   DemoProvider   │           │ Hugging Face API │           │ ComfyUI / Local  │
    │  (100% Offline)  │           │  (Gradio Spaces) │           │ (Workstation GPU)│
    ├──────────────────┤           ├──────────────────┤           ├──────────────────┤
    │ • Zero GPU       │           │ • Wan2.1 ZeroGPU │           │ • Direct HTTP    │
    │ • Canvas Rec.    │           │ • Gradio Queue   │           │ • 127.0.0.1:8188 │
    │ • Simulated Logs │           │ • SSE Streaming  │           │ • Private VRAM   │
    │ • Sample Catalog │           │ • Optional Token │           │ • Custom Workflows│
    └──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 📊 Features: Offline Demo vs. Real Compute

| Feature | Offline Demo Mode | Hugging Face Spaces | Local ComfyUI Workstation |
|---|---|---|---|
| **Text-to-Video Generation** | ✅ Instant Simulation | ✅ Real AI Inference | ✅ Real AI Inference |
| **Image-to-Video Animation** | ✅ Instant Simulation | ✅ Real AI Inference | ✅ Real AI Inference |
| **Requires GPU / Hardware** | ❌ None (Runs on any phone/PC) | ❌ Free Cloud ZeroGPU | ⚠️ 12GB–24GB VRAM required |
| **Requires API Token** | ❌ No | ⚪ Optional (Read-only) | ❌ No |
| **Video Playback & Scrubbing** | ✅ Full Player | ✅ Full Player | ✅ Full Player |
| **Video Download (MP4/WebM)** | ✅ Supported | ✅ Supported | ✅ Supported |
| **History & Preset Reuse** | ✅ Local Storage | ✅ Local Storage | ✅ Local Storage |
| **Financial Cost** | **₹0 Free Forever** | **₹0 Free Forever** | **₹0 (Your hardware)** |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm** or **yarn**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/open-video-studio.git
cd open-video-studio

# Install dependencies
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Test Suite
```bash
npm run test
```
Executes all 33 unit and component tests with Vitest and React Testing Library.

### 5. Build for Production
```bash
npm run build
```
Generates optimized, minified production assets into the `dist/` directory.

---

## 🌐 Deploying to GitHub Pages

Open Video Studio is configured for one-click static hosting on GitHub Pages:

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: complete open video studio release"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Navigate to your repository on GitHub.
2. Go to **Settings** ➔ **Pages**.
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.

### Step 3: Automated Workflow Execution
The included `.github/workflows/deploy.yml` workflow will automatically:
1. Check out code and set up Node.js 20.
2. Install dependencies with `npm ci`.
3. Run the automated Vitest test suite (`npm run test`).
4. Build production assets (`npm run build`).
5. Deploy the `dist/` directory directly to GitHub Pages.

Your site will be live at:
`https://<your-username>.github.io/<your-repo-name>/`

---

## 🧠 Open-Source Model Strategy

### 1. Wan2.1 (Alibaba Cloud / Wan-AI)
- **License**: **Apache 2.0** (Permissive open source; commercial use permitted).
- **Variants Supported**:
  - `wan2.1-t2v-1.3b`: 1.3 Billion parameters, 480p resolution, requires ~8.2GB VRAM (FP8), runnable on consumer RTX 3060/4070 GPUs.
  - `wan2.1-t2v-14b`: 14 Billion parameters flagship DiT, 720p resolution, requires 24GB VRAM in FP8 (RTX 3090/4090) or 48GB+ native BF16.
  - `wan2.1-i2v-14b-720p`: Premier image animation with high temporal consistency and facial identity preservation.
  - `wan2.1-i2v-14b-480p`: Fast preview variant with lower memory requirements (~16GB).
- **Official Weights**: [Hugging Face Wan-AI](https://huggingface.co/Wan-AI)

### 2. LTX-Video 0.9.1 (Lightricks)
- **License**: **OpenRAIL-M**
- **Specs**: ~2B parameters, real-time generation (~5 seconds on high-end GPUs), 768x512 native resolution.

### 3. CogVideoX-5B (THUDM / Zhipu AI)
- **License**: **Apache 2.0**
- **Specs**: 5B parameters, 3D Expert Transformer, 720x480 resolution, requires ~12GB VRAM with INT8/FP4 quantization.

---

## 🔒 Security & Privacy Policy

- **No Secrets in Frontend**: Never commit Hugging Face write tokens or private keys. The frontend is static client code.
- **In-Memory Token Storage**: Any user-provided Hugging Face Access Token is kept strictly in React memory (`useState`) and is never written to disk, cookies, or remote databases.
- **Safe Object URLs**: Temporary browser blob URLs are automatically revoked when items are deleted to eliminate memory leaks.
- **Client-Side Image Validation**: Uploaded keyframes remain in the browser until generation is explicitly initiated.

---

## 🛠️ Troubleshooting & FAQ

#### Q: How do I test the application without any GPU or API keys?
**A:** Open Video Studio starts in **Demo Mode** by default! Simply enter a prompt, select any model, and click **Generate AI Video**. The virtual GPU runner simulates all generation stages and outputs real playable video clips immediately.

#### Q: How do I connect to a real Hugging Face Gradio Space?
1. Go to **Settings**.
2. Select **Hugging Face Gradio Spaces**.
3. Enter the Space ID (e.g., `Wan-AI/Wan2.1-T2V-14B`).
4. (Optional) Provide a free read-only Hugging Face access token for priority queueing.
5. Click **Test Connection** to verify availability before generating.

#### Q: How do I connect to a local ComfyUI installation?
1. Start your local ComfyUI instance with CORS enabled:
   ```bash
   python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header
   ```
2. In Open Video Studio ➔ **Settings**, select **Custom / ComfyUI Local Server**.
3. Verify the endpoint URL is `http://127.0.0.1:8188` and click **Ping Server**.

---

## 📄 License & Attribution

- **Open Video Studio**: [MIT License](LICENSE)
- **Wan2.1**: Copyright © 2025 Alibaba Cloud / Wan-AI. Licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
- **CogVideoX**: Copyright © 2024 THUDM / Zhipu AI. Licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
- **LTX-Video**: Copyright © 2024 Lightricks. Licensed under [OpenRAIL-M](https://huggingface.co/Lightricks/LTX-Video/blob/main/LICENSE.txt).
- **Icons**: [Lucide React](https://lucide.dev) (ISC License).
