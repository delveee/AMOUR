# AmourChat - Romantic Anonymous Connection

## Prerequisites
- Node.js (v18 or higher)
- npm

## Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   Start the frontend and backend in development mode (requires two terminals or concurrent setup, currently backend runs separately):
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend (if needed for local dev, or use `npm run start` to test prod build)
   # You can use `npx tsx server/index.ts` to run the backend in watch mode if desired.
   ```
   *Note: efficient development usually involves running `npm run dev` for frontend hot-reload and running the backend separately.*

## Production Check & Deployment

The application is configured to be deployed as a monolithic Node.js application (Backend serving Frontend).

1. **Build**
   ```bash
   npm run build
   ```
   This compiles the React frontend to `dist/` and the TypeScript backend to `dist-server/`.

2. **Test Production Build Locally**
   ```bash
   npm start
   ```
   This runs the optimized backend serving the static frontend files on `http://localhost:3001`.

3. **Deploy to Render/Railway/Heroku**
   - Connect your GitHub repository.
   - Use the **Build Command**: `npm run build`
   - Use the **Start Command**: `npm start`
   - The server will automatically use the `PORT` provided by the host.

## Features
- **Queue System:** Instantly pairs 2 available users based on interests.
- **Real-time:** Socket.IO ensures low latency messaging.
- **Video Chat:** WebRTC integration for face-to-face connection.
- **Auto-Reconnect:** Seamless partner switching.
- **Responsive Design:** Works beautifully on mobile and desktop.
