# RPL Analytics Full-Stack Migration & Deployment Guide

This guide describes how to export, set up, and deploy the entire Rugby Premier League (RPL) Analytics full-stack application (React frontend + Express server) in your new environment.

---

## 1. How to download your ZIP package from AI Studio
1. Open the **Settings Menu** in the upper-right corner of Google AI Studio.
2. Look for the **"Export to ZIP"** or **"Download ZIP"** option.
3. Click to save the compiled project archive containing all frontend assets, backend codes, the `Dockerfile`, and metadata.
4. Unzip the downloaded file on your target machine or server.

---

## 2. Option A: Native Node.js Deployment (NPM Setup)

Use these steps to run the application directly inside your local environment or standard server (e.g., VPS, VM).

### Prerequisites
- **Node.js**: Version 20.x or higher is highly recommended (minimum 18.x).
- **NPM**: standard package manager matching your version of Node.js.

### Step 1: Install Dependencies
Run the install command to populate `node_modules` for both production and dev configurations:
```bash
npm install
```

### Step 2: Running in Development Mode
To run with hot reloading for development, run:
```bash
npm run dev
```
The application will boot on `http://localhost:3000`. This uses Vite's developer middleware integrated directly inside the Express server (`server.ts`).

### Step 3: Compiling for Production
This step builds both components:
1. Compiles the React + Vite frontend into optimized static asset bundles in `/dist`.
2. Bundles the Express custom backend (`server.ts`) using `esbuild` into `/dist/server.cjs` as a unified CommonJS file.

```bash
npm run build
```

### Step 4: Running the Production Server
Start the production server using the built assets:
```bash
npm run start
```
The application runs on port `3000` with the production-ready server and optimal delivery.

---

## 3. Option B: Docker Container Deployment (Enterprise Setup)

To avoid managing Node.js versions or dependencies, use our multi-stage, lightweight production container.

### Prerequisites
- **Docker** and **Docker Compose** installed.

### Step 1: Build and Run with Docker Compose
Run the following single command in the project root folder:
```bash
docker compose up -d --build
```

- `-d`: Runs the container in detached background mode.
- `--build`: Forces a full rebuild of the image stages (install, build, run).

### Step 2: Verify Status
Check the status of your running container:
```bash
docker compose ps
```
The container will be exposed and running on **`http://localhost:3000`**.

### Step 3: Stopping the Container
To turn off or remove the container safely:
```bash
docker compose down
```

---

## 4. Environment Variables
This application parses the environment variables dynamically.
- `PORT`: Define custom port bindings (default is `3000`).
- `NODE_ENV`: Set to `production` or `development` to shift build characteristics.
- Configuration is mirrored in the `.env.example` file included in this bundle.

---

This complete architecture combines robust real-time PDF generation, Excel tables integration, Word summary reports, and player comparisons on a single responsive pane!
