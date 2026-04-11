import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getSocket } from '../../socket/client';

export function Chat() {
  const [input, setInput] = useState('');
  const messages = useGameStore((s) => s.chatMessages);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    getSocket().emit('chat:message', { content: text });
    setInput('');
  };

  return (
    <div style={s.wrap}>
      <div style={s.log}>
        {messages.length === 0 && (
          <p style={s.empty}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={s.msg}>
            <span style={msg.userId === 'system' ? s.system : s.name}>
              {msg.username}
            </span>
            {msg.diceResult ? (
              <span style={s.dice}>
                {' rolled '}
                <em>{msg.diceResult.formula}</em>
                {' → ['}
                {msg.diceResult.rolls.join(', ')}
                {'] = '}
                <strong>{msg.diceResult.total}</strong>
              </span>
            ) : (
              <span style={msg.whisperTo ? s.whisper : s.text}>
                {msg.whisperTo ? ` [→ ${msg.whisperTo}] ` : ': '}
                {msg.content}
              </span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="/w username … or just type"
        />
        <button style={s.btn} onClick={send}>↑</button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  log: { flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 },
  empty: { color: '#555', fontSize: 13, fontStyle: 'italic', margin: 'auto' },
  msg: { fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' },
  name: { color: '#4a90d9', fontWeight: 'bold' },
  system: { color: '#666', fontStyle: 'italic' },
  text: { color: '#ccc' },
  whisper: { color: '#b088f9', fontStyle: 'italic' },
  dice: { color: '#ffd700' },
  inputRow: { display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid #222' },
  input: {
    flex: 1, background: '#0a0a1a', color: '#eee',
    border: '1px solid #333', borderRadius: 4, padding: '7px 10px', fontSize: 13,
  },
  btn: {
    background: '#4a90d9', color: '#fff', border: 'none',
    borderRadius: 4, padding: '7px 13px', cursor: 'pointer', fontSize: 16,
  },
};
