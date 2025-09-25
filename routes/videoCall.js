// routes/videoCall.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { createServer } from "http";

const router = express.Router();

// Store active rooms
const activeRooms = new Map();

// Room management functions
const createRoom = (roomId, hostId) => {
  const room = {
    id: roomId,
    hostId,
    participants: new Map(),
    createdAt: new Date(),
    status: 'waiting' // waiting, active, ended
  };
  activeRooms.set(roomId, room);
  return room;
};

const joinRoom = (roomId, participantId, socket) => {
  const room = activeRooms.get(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  
  if (room.participants.size >= 2) {
    return { success: false, error: 'Room is full' };
  }
  
  room.participants.set(participantId, {
    id: participantId,
    socket,
    joinedAt: new Date()
  });
  
  if (room.participants.size === 2) {
    room.status = 'active';
  }
  
  return { success: true, room };
};

const leaveRoom = (roomId, participantId) => {
  const room = activeRooms.get(roomId);
  if (!room) return;
  
  room.participants.delete(participantId);
  
  if (room.participants.size === 0) {
    activeRooms.delete(roomId);
  } else {
    room.status = 'waiting';
  }
};

// HTTP Routes
router.post("/api/video-call/create", (req, res) => {
  try {
    const { hostId, hostName } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: "Host ID is required" });
    }
    
    const roomId = uuidv4();
    const room = createRoom(roomId, hostId);
    
    // Generate reference links
    const hostLink = `${req.protocol}://${req.get('host')}/video-call/${roomId}?role=host&id=${hostId}&name=${encodeURIComponent(hostName || 'Host')}`;
    const guestLink = `${req.protocol}://${req.get('host')}/video-call/${roomId}?role=guest`;
    
    res.json({
      success: true,
      roomId,
      hostLink,
      guestLink,
      room: {
        id: room.id,
        status: room.status,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create video call room" });
  }
});

router.get("/api/video-call/room/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;
    const room = activeRooms.get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json({
      success: true,
      room: {
        id: room.id,
        status: room.status,
        participantCount: room.participants.size,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room details" });
  }
});

router.post("/api/video-call/join", (req, res) => {
  try {
    const { roomId, participantId, participantName } = req.body;
    console.log(roomId);
    
    if (!roomId || !participantId) {
      return res.status(400).json({ error: "Room ID and Participant ID are required" });
    }
    
    const room = activeRooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    if (room.participants.size >= 2) {
      return res.status(400).json({ error: "Room is full" });
    }
    
    res.json({
      success: true,
      room: {
        id: room.id,
        status: room.status,
        participantCount: room.participants.size + 1
      }
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
});

// Socket.IO setup for WebRTC signaling
const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', (data) => {
      const { roomId, participantId, participantName } = data;
      
      if (!roomId || !participantId) {
        socket.emit('error', { message: 'Room ID and Participant ID are required' });
        return;
      }

      const result = joinRoom(roomId, participantId, socket);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.participantId = participantId;

      // Notify other participants
      socket.to(roomId).emit('user-joined', {
        participantId,
        participantName: participantName || 'Anonymous'
      });

      // Send current participants to the new user
      const room = activeRooms.get(roomId);
      const participants = Array.from(room.participants.values()).map(p => ({
        id: p.id,
        name: p.name || 'Anonymous'
      }));

      socket.emit('room-joined', {
        roomId,
        participants,
        isHost: room.hostId === participantId
      });

      console.log(`User ${participantId} joined room ${roomId}`);
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
      socket.to(socket.roomId).emit('offer', {
        offer: data.offer,
        from: socket.participantId
      });
    });

    socket.on('answer', (data) => {
      socket.to(socket.roomId).emit('answer', {
        answer: data.answer,
        from: socket.participantId
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(socket.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.participantId
      });
    });

    // Handle call controls
    socket.on('toggle-mute', (data) => {
      socket.to(socket.roomId).emit('user-muted', {
        participantId: socket.participantId,
        isMuted: data.isMuted
      });
    });

    socket.on('toggle-video', (data) => {
      socket.to(socket.roomId).emit('user-video-toggled', {
        participantId: socket.participantId,
        isVideoOn: data.isVideoOn
      });
    });

    socket.on('end-call', () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('call-ended', {
          endedBy: socket.participantId
        });
        leaveRoom(socket.roomId, socket.participantId);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.roomId && socket.participantId) {
        socket.to(socket.roomId).emit('user-left', {
          participantId: socket.participantId
        });
        leaveRoom(socket.roomId, socket.participantId);
      }
    });
  });

  return io;
};

export { router, setupSocketIO };
export default router;
