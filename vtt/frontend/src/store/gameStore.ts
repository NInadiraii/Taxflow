import { create } from 'zustand';
import type { Token, ChatMessage, InitiativeEntry, FogTile, Room } from '../types';

interface GameState {
  room: Room | null;
  tokens: Token[];
  chatMessages: ChatMessage[];
  initiativeOrder: InitiativeEntry[];
  fogTiles: FogTile[];
  currentInitIndex: number;
  userId: string | null;
  username: string | null;
  role: 'gm' | 'player' | null;

  setRoom: (room: Room) => void;
  moveToken: (id: string, x: number, y: number) => void;
  addToken: (token: Token) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setInitiativeOrder: (order: InitiativeEntry[]) => void;
  nextInitiative: () => void;
  revealFog: (x: number, y: number) => void;
  setFogTiles: (tiles: FogTile[]) => void;
  setUser: (id: string, username: string, role: 'gm' | 'player') => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  tokens: [],
  chatMessages: [],
  initiativeOrder: [],
  fogTiles: [],
  currentInitIndex: 0,
  userId: null,
  username: null,
  role: null,

  setRoom: (room) =>
    set({ room, tokens: room.tokens }),

  moveToken: (id, x, y) =>
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, x, y } : t)),
    })),

  addToken: (token) =>
    set((state) => ({ tokens: [...state.tokens, token] })),

  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  setInitiativeOrder: (order) => set({ initiativeOrder: order, currentInitIndex: 0 }),

  nextInitiative: () =>
    set((state) => ({
      currentInitIndex:
        (state.currentInitIndex + 1) % Math.max(1, state.initiativeOrder.length),
    })),

  revealFog: (x, y) =>
    set((state) => ({
      fogTiles: state.fogTiles.map((tile) =>
        tile.x === x && tile.y === y ? { ...tile, revealed: true } : tile
      ),
    })),

  setFogTiles: (tiles) => set({ fogTiles: tiles }),

  setUser: (id, username, role) => set({ userId: id, username, role }),
}));
