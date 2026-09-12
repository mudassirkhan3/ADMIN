# AI Nursing Study Assistant (BSN)

A professional, mobile-friendly AI study assistant tailored for Bachelor of Science in Nursing (BSN) students, featuring subject selectors, interactive MCQ generation, timed exams, viva voice simulation, and note management.

## Deployment Guide (Beginner Friendly)

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com/) and log in.
2. Click the **"+"** icon in the top right and select **New repository**.
3. Name your repository `bsn-study-assistant`.
4. Set it to **Public** and check **Add a README file**, then click **Create repository**.

### Step 2: Upload Project Files
1. In your new repository, click **Add file** -> **Upload files**.
2. Drag and drop your `index.html`, `style.css`, `script.js`, and `README.md` files.
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages
1. Go to your repository **Settings** tab.
2. In the left sidebar, click on **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` branch and `/ (root)` folder, then click **Save**.
5. After a minute, GitHub will provide your live website URL!

### Step 4: Deploying the Backend API Proxy
Because GitHub Pages cannot securely hide API keys, deploy `server.js` and `package.json` to a free cloud host like [Render](https://render.com/) or [Railway](https://railway.app/). Set your environment variable `GEMINI_API_KEY` in their dashboard.
