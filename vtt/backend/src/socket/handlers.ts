import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import type { Room, ChatMessage, DiceResult, InitiativeEntry } from '../types';

// In-memory state (swap for Redis in production)
const rooms = new Map<string, Room>();
const socketRoom = new Map<string, string>();   // socketId → roomId
const socketName = new Map<string, string>();   // socketId → username

function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      name: `Room ${roomId}`,
      gmId: '',
      gridSize: 50,
      tokens: [],
      fogRevealed: new Set(),
    });
  }
  return rooms.get(roomId)!;
}

function roomState(room: Room) {
  return {
    ...room,
    fogRevealed: undefined, // don't serialise the Set; send fog separately
  };
}

export function registerHandlers(io: Server, socket: Socket): void {
  const username = `Player-${socket.id.slice(0, 5)}`;
  socketName.set(socket.id, username);

  // ── Room ──────────────────────────────────────────────────────────────────
  socket.on('room:join', ({ roomId }: { roomId: string }) => {
    socket.join(roomId);
    socketRoom.set(socket.id, roomId);

    const room = getOrCreateRoom(roomId);
    const isFirstJoiner = !room.gmId;
    if (isFirstJoiner) room.gmId = socket.id;

    const role = room.gmId === socket.id ? 'gm' : 'player';
    socket.emit('user:assigned', { id: socket.id, username, role });
    socket.emit('room:state', roomState(room));

    const sysMsg: ChatMessage = {
      id: uuid(),
      userId: 'system',
      username: 'System',
      content: `${username} joined${isFirstJoiner ? ' as GM' : ''}.`,
      timestamp: Date.now(),
    };
    io.in(roomId).emit('chat:message', sysMsg);
  });

  // ── Tokens ────────────────────────────────────────────────────────────────
  socket.on('token:move', ({ tokenId, x, y }: { tokenId: string; x: number; y: number }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const token = room.tokens.find((t) => t.id === tokenId);
    if (token) { token.x = x; token.y = y; }

    socket.to(roomId).emit('token:moved', { tokenId, x, y });
  });

  // ── Chat ──────────────────────────────────────────────────────────────────
  socket.on('chat:message', ({ content }: { content: string }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId || !content.trim()) return;

    const name = socketName.get(socket.id) ?? 'Unknown';
    let whisperTo: string | undefined;
    let text = content.trim();

    // /w username message
    const wMatch = text.match(/^\/w\s+(\S+)\s+([\s\S]+)/);
    if (wMatch) {
      whisperTo = wMatch[1];
      text = wMatch[2];
    }

    const msg: ChatMessage = {
      id: uuid(),
      userId: socket.id,
      username: name,
      content: text,
      timestamp: Date.now(),
      whisperTo,
    };

    if (whisperTo) {
      socket.emit('chat:message', msg);
      io.in(roomId).fetchSockets().then((sockets) => {
        const target = sockets.find((s) => socketName.get(s.id) === whisperTo);
        target?.emit('chat:message', msg);
      });
    } else {
      io.in(roomId).emit('chat:message', msg);
    }
  });

  // ── Dice ──────────────────────────────────────────────────────────────────
  socket.on('dice:roll', (result: DiceResult) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;

    const name = socketName.get(socket.id) ?? 'Unknown';
    const msg: ChatMessage = {
      id: uuid(),
      userId: socket.id,
      username: name,
      content: '',
      timestamp: Date.now(),
      diceResult: result,
    };
    io.in(roomId).emit('chat:message', msg);
  });

  // ── Initiative ────────────────────────────────────────────────────────────
  socket.on('initiative:update', (order: InitiativeEntry[]) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.gmId !== socket.id) return; // GM only

    io.in(roomId).emit('initiative:updated', order);
  });

  socket.on('initiative:next', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.gmId !== socket.id) return;

    socket.to(roomId).emit('initiative:next');
  });

  // ── Fog of war ────────────────────────────────────────────────────────────
  socket.on('fog:reveal', ({ x, y }: { x: number; y: number }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.gmId !== socket.id) return; // GM only

    room.fogRevealed.add(`${x},${y}`);
    socket.to(roomId).emit('fog:revealed', { x, y });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const roomId = socketRoom.get(socket.id);
    const name = socketName.get(socket.id) ?? 'Unknown';

    if (roomId) {
      const sysMsg: ChatMessage = {
        id: uuid(),
        userId: 'system',
        username: 'System',
        content: `${name} left.`,
        timestamp: Date.now(),
      };
      io.in(roomId).emit('chat:message', sysMsg);
      socketRoom.delete(socket.id);
    }
    socketName.delete(socket.id);
  });
}
