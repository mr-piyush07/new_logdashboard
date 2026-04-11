# Complete IoT Dashboard Deployment Guide

This guide outlines exactly how to take your IoT system from your local machine to a live production environment. It covers the Express Backend, the React Frontend, and explains the roles of the specific folders in your directory.

---

## 1. Directory Explanations (`scratch` & `esp32_firmware`)

### What is the `scratch` folder?
- **Importance:** Not important for production.
- **Explanation:** The `scratch` directory contains temporary testing scripts (like your `check_db.js` file). It is purely used by developers to test database connections or logic in an isolated way without running the whole app. 
- **Deployment Action:** **IGNORE IT.** Do not upload the `scratch` folder to your production servers.

### What is the `esp32_firmware` folder?
- **Importance:** Critical for your physical hardware, but NOT hosted on the web.
- **Explanation:** This folder contains the C++ code (`esp32_firmware.ino` and `esp32_firmware_v2.txt`) that brings your ESP32 microcontrollers to life. Your IoT dashboard cannot receive data or send hardware commands if the ESP32 isn't running this code.
- **Deployment Action:** 
  1. This code is "deployed" physically. You do not host this on a web server.
  2. Install the **Arduino IDE** on your computer.
  3. Open `esp32_firmware\esp32_firmware.ino` (or copy the contents of `v2` into an `.ino` file).
  4. Ensure you update the `#define WIFI_SSID` and `#define WIFI_PASSWORD` to the Wi-Fi network the ESP32 will connect to permanently.
  5. Plug the ESP32 into your computer via a USB data cable and click the **Upload (Flash)** button in the Arduino IDE. Once flashed, the chip will run forever as long as it has power.

---

## 2. Backend Deployment (Node.js/Express)

The backend must be hosted on a cloud provider that supports always-on Node.js environments (like **Render**, **Railway**, **Heroku**, or a VPS like **DigitalOcean**).

**Deployment Steps:**
1. Upload your entire codebase to a GitHub repository (do not upload the `.env` file).
2. Go to a provider like **Render.com** and select **New Web Service**.
3. Connect your GitHub account and select your repository.
4. **Configuration:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start` (make sure `{ "start": "node src/app.js" }` is in your `backend/package.json`)
5. **Environment Variables:** Input all the keys from your `backend/.env` file manually into the hosting provider's dashboard:
   - `PORT`, `MONGODB_URI`, `MQTT_HOST`, `MQTT_PORT`, `MQTT_USERNAME`, `MQTT_PASSWORD`
6. Deploy! The provider will give you a live URL (e.g., `https://my-backend-iot.onrender.com`).

---

## 3. Frontend Deployment (React/Vite)

The frontend is a static web application and can be hosted for free on fast CDN networks like **Vercel**, **Netlify**, or **Cloudflare Pages**.

**Deployment Steps:**
1. Before deploying, you must update the API URL so the frontend knows where the new live backend is.
2. In your Vercel or Netlify dashboard, connect your GitHub repository.
3. **Configuration:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:** You MUST set the environment variable pointing to your live backend URL (from step 2):
   - `VITE_API_URL=https://my-backend-iot.onrender.com/api`
   - `VITE_WS_URL=https://my-backend-iot.onrender.com`
5. Deploy! Vercel or Netlify will build your static files and give you a live URL where you can view your dashboard anywhere in the world.

---

## Final Production Flow
1. The **ESP32** powers on, connects to Wi-Fi using the `esp32_firmware.ino` details, and links to HiveMQ.
2. The **Render Backend** permanently listens to HiveMQ and saves data to MongoDB Atlas.
3. You open your **Vercel Frontend URL** on your phone.
4. The frontend fetches history via the Backend API and establishes a WebSocket connection to stream live telemetry updates and trigger remote Hardware Commands.
