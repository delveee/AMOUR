import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * NEON CHAT SERVER
 * Handles queueing, pairing, WebRTC signaling, and Static File Serving.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface User {
  id: string;
  partnerId: string | null;
  interests: string[];
  isTyping: boolean;
}

// State Management
const users = new Map<string, User>();
const waitingQueue: string[] = [];

// Helper to find common elements
const getCommonInterests = (arr1: string[], arr2: string[]): string[] => {
  return arr1.filter(value => arr2.includes(value));
};

// Broadcast online count to everyone
const broadcastOnlineCount = () => {
  io.emit('online_count', users.size);
};

const handleMatch = () => {
  if (waitingQueue.length < 2) return;

  const matchedIds = new Set<string>();
  const matchesToProcess: Array<{ u1: string, u2: string, common: string[] }> = [];

  // Attempt to match users
  for (let i = 0; i < waitingQueue.length; i++) {
    const user1Id = waitingQueue[i];
    if (matchedIds.has(user1Id)) continue;

    const user1 = users.get(user1Id);
    if (!user1) continue;

    // Look for a suitable partner
    for (let j = i + 1; j < waitingQueue.length; j++) {
      const user2Id = waitingQueue[j];
      if (matchedIds.has(user2Id)) continue;

      const user2 = users.get(user2Id);
      if (!user2) continue;

      const u1HasInterests = user1.interests.length > 0;
      const u2HasInterests = user2.interests.length > 0;
      let isMatch = false;
      let commonTags: string[] = [];

      if (u1HasInterests) {
        if (u2HasInterests) {
          const intersection = getCommonInterests(user1.interests, user2.interests);
          if (intersection.length > 0) {
            isMatch = true;
            commonTags = intersection;
          }
        }
      } else {
        if (!u2HasInterests) {
          isMatch = true;
        }
      }

      if (isMatch) {
        matchesToProcess.push({ u1: user1Id, u2: user2Id, common: commonTags });
        matchedIds.add(user1Id);
        matchedIds.add(user2Id);
        break;
      }
    }
  }

  // Remove matched users from queue
  if (matchedIds.size > 0) {
    const nextQueue = waitingQueue.filter(id => !matchedIds.has(id));
    waitingQueue.length = 0;
    waitingQueue.push(...nextQueue);
  }

  // Notify users
  for (const match of matchesToProcess) {
    const { u1, u2, common } = match;
    const user1 = users.get(u1);
    const user2 = users.get(u2);

    if (user1 && user2) {
      user1.partnerId = u2;
      user2.partnerId = u1;

      io.to(u1).emit('matched', { partnerId: u2, commonInterests: common });
      io.to(u2).emit('matched', { partnerId: u1, commonInterests: common });

      console.log(`Matched ${u1} with ${u2} [Tags: ${common.join(', ')}]`);
    }
  }
};

const addToQueue = (socketId: string, interests: string[] = []) => {
  const user = users.get(socketId);
  if (!user) return;

  user.interests = interests;

  if (user.partnerId) return;

  if (!waitingQueue.includes(socketId)) {
    waitingQueue.push(socketId);
    handleMatch();
  }
};

io.on('connection', (socket: Socket) => {
  users.set(socket.id, {
    id: socket.id,
    partnerId: null,
    interests: [],
    isTyping: false
  });

  // Immediate update
  broadcastOnlineCount();

  socket.on('join_queue', (data: { interests: string[] }) => {
    addToQueue(socket.id, data.interests);
  });

  socket.on('send_message', (data: { text: string }) => {
    const user = users.get(socket.id);
    if (user && user.partnerId) {
      io.to(user.partnerId).emit('message', { text: data.text });
    }
  });

  // WebRTC Signaling Relay
  socket.on('signal', (data: { target: string, signal: any }) => {
    io.to(data.target).emit('signal', data.signal);
  });

  socket.on('typing', (isTyping: boolean) => {
    const user = users.get(socket.id);
    if (user && user.partnerId) {
      io.to(user.partnerId).emit('partner_typing', isTyping);
    }
  });

  socket.on('next_partner', (data: { interests: string[] }) => {
    const user = users.get(socket.id);
    if (user) {
      if (user.partnerId) {
        io.to(user.partnerId).emit('partner_disconnected');
        const partner = users.get(user.partnerId);
        if (partner) partner.partnerId = null;
        user.partnerId = null;
      }

      const queueIndex = waitingQueue.indexOf(socket.id);
      if (queueIndex > -1) {
        waitingQueue.splice(queueIndex, 1);
      }

      addToQueue(socket.id, data.interests);
    }
  });

  socket.on('leave_queue', () => {
    const user = users.get(socket.id);
    if (user && user.partnerId) {
      io.to(user.partnerId).emit('partner_disconnected');
      const partner = users.get(user.partnerId);
      if (partner) partner.partnerId = null;
      user.partnerId = null;
    }

    const queueIndex = waitingQueue.indexOf(socket.id);
    if (queueIndex > -1) {
      waitingQueue.splice(queueIndex, 1);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);

    const queueIndex = waitingQueue.indexOf(socket.id);
    if (queueIndex > -1) {
      waitingQueue.splice(queueIndex, 1);
    }

    if (user && user.partnerId) {
      io.to(user.partnerId).emit('partner_disconnected');
      const partner = users.get(user.partnerId);
      if (partner) partner.partnerId = null;
    }

    users.delete(socket.id);
    broadcastOnlineCount();
  });
});

// SERVE STATIC ASSETS IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  // Static folder (client build)
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch-all route to serve index.html for client-side routing
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});