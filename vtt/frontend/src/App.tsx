import React, { useEffect, useRef, useState } from 'react';
import { MapEngine } from './components/MapEngine/MapEngine';
import { DiceRoller } from './components/DiceRoller/DiceRoller';
import { Chat } from './components/Chat/Chat';
import { InitiativeTracker } from './components/InitiativeTracker/InitiativeTracker';
import { CharacterSheet } from './components/CharacterSheet/CharacterSheet';
import { useGameStore } from './store/gameStore';
import { connectSocket } from './socket/client';
import type { ChatMessage, InitiativeEntry } from './types';

type Panel = 'chat' | 'dice' | 'initiative' | 'sheet';

const PANELS: { key: Panel; label: string }[] = [
  { key: 'chat', label: 'Chat' },
  { key: 'dice', label: 'Dice' },
  { key: 'initiative', label: 'Initiative' },
  { key: 'sheet', label: 'Sheet' },
];

export default function App() {
  const [panel, setPanel] = useState<Panel>('chat');
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const { setRoom, moveToken, addChatMessage, setInitiativeOrder, nextInitiative, revealFog, setUser } =
    useGameStore();

  // Measure map canvas area
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setMapSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Socket setup
  useEffect(() => {
    const socket = connectSocket('demo-token');

    socket.on('connect', () => {
      socket.emit('room:join', { roomId: 'demo-room' });
    });

    socket.on('room:state', (room) => {
      setRoom(room);
    });

    socket.on('user:assigned', ({ id, username, role }: { id: string; username: string; role: 'gm' | 'player' }) => {
      setUser(id, username, role);
    });

    socket.on('token:moved', ({ tokenId, x, y }: { tokenId: string; x: number; y: number }) => {
      moveToken(tokenId, x, y);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      addChatMessage(msg);
    });

    socket.on('initiative:updated', (order: InitiativeEntry[]) => {
      setInitiativeOrder(order);
    });

    socket.on('initiative:next', () => {
      nextInitiative();
    });

    socket.on('fog:revealed', ({ x, y }: { x: number; y: number }) => {
      revealFog(x, y);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={s.app}>
      {/* Map canvas */}
      <div ref={mapRef} style={s.map}>
        {mapSize.w > 0 && <MapEngine width={mapSize.w} height={mapSize.h} />}
      </div>

      {/* Right panel */}
      <div style={s.sidebar}>
        <div style={s.tabs}>
          {PANELS.map(({ key, label }) => (
            <button
              key={key}
              style={{ ...s.tab, ...(panel === key ? s.activeTab : {}) }}
              onClick={() => setPanel(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={s.content}>
          {panel === 'chat' && <Chat />}
          {panel === 'dice' && <DiceRoller />}
          {panel === 'initiative' && <InitiativeTracker />}
          {panel === 'sheet' && <CharacterSheet />}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  app: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#111' },
  map: { flex: 1, overflow: 'hidden', position: 'relative' },
  sidebar: {
    width: 310, display: 'flex', flexDirection: 'column',
    background: '#16213e', borderLeft: '1px solid #1e2a40',
  },
  tabs: { display: 'flex', borderBottom: '1px solid #1e2a40', flexShrink: 0 },
  tab: {
    flex: 1, padding: '11px 4px', background: 'transparent', color: '#555',
    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  activeTab: {
    color: '#eee', background: '#0f1a30',
    borderBottom: '2px solid #4a90d9',
  },
  content: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};
