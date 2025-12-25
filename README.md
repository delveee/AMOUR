# NeonChat - Anonymous Chat Application

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Installation & Running

### 1. Dependencies
Since this is a single folder structure for the demo, you need to install packages for both frontend and backend.

```bash
# Frontend dependencies
npm install react react-dom lucide-react socket.io-client framer-motion

# Backend dependencies
npm install express socket.io cors
npm install -D typescript ts-node @types/react @types/react-dom @types/node @types/express @types/cors tailwindcss postcss autoprefixer
```

### 2. Run the Backend (Server)
Open a terminal and run:

```bash
# Using ts-node directly
npx ts-node server/index.ts
```
The server will start on `http://localhost:3001`.

### 3. Run the Frontend (Client)
Open a **new** terminal window and run your development server (e.g., via Vite or Create React App). Assuming you have a Vite setup:

```bash
npm run dev
```
The app will open at `http://localhost:5173` (or similar).

## Deployment

1. **Backend:** Deploy `server/index.ts` to a Node.js host (Heroku, Render, Railway). 
   - Ensure you update the `PORT` environment variable.
2. **Frontend:** Deploy the React app to Vercel or Netlify.
   - **Important:** Update `SOCKET_URL` in `hooks/useChat.ts` to point to your deployed backend URL (e.g., `https://my-backend.onrender.com`).

## Features
- **Queue System:** Instantly pairs 2 available users.
- **Real-time:** Socket.IO ensures <20ms latency.
- **Auto-Reconnect:** "Next" button automatically handles disconnect logic and re-queues.
- **Cyberpunk UI:** Custom Tailwind config in `index.html`.
