import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getSocket } from '../../socket/client';
import type { InitiativeEntry } from '../../types';

export function InitiativeTracker() {
  const { initiativeOrder, currentInitIndex, setInitiativeOrder, nextInitiative, role } =
    useGameStore();
  const [name, setName] = useState('');
  const [init, setInit] = useState('');

  const add = () => {
    if (!name.trim() || !init) return;
    const entry: InitiativeEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      initiative: parseInt(init),
    };
    const updated = [...initiativeOrder, entry].sort((a, b) => b.initiative - a.initiative);
    setInitiativeOrder(updated);
    getSocket().emit('initiative:update', updated);
    setName('');
    setInit('');
  };

  const remove = (id: string) => {
    const updated = initiativeOrder.filter((e) => e.id !== id);
    setInitiativeOrder(updated);
    getSocket().emit('initiative:update', updated);
  };

  const next = () => {
    nextInitiative();
    getSocket().emit('initiative:next');
  };

  return (
    <div style={s.wrap}>
      <div style={s.list}>
        {initiativeOrder.length === 0 && (
          <p style={s.empty}>No combatants yet.</p>
        )}
        {initiativeOrder.map((entry, i) => (
          <div key={entry.id} style={{ ...s.entry, ...(i === currentInitIndex ? s.active : {}) }}>
            <span style={s.badge}>{entry.initiative}</span>
            <span style={s.entryName}>{entry.name}</span>
            {role === 'gm' && (
              <button style={s.del} onClick={() => remove(entry.id)}>✕</button>
            )}
          </div>
        ))}
      </div>

      {role === 'gm' && (
        <div style={s.controls}>
          <div style={s.addRow}>
            <input
              style={{ ...s.input, flex: 1 }}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <input
              style={{ ...s.input, width: 55 }}
              placeholder="Init"
              type="number"
              value={init}
              onChange={(e) => setInit(e.target.value)}
            />
            <button style={s.addBtn} onClick={add}>+</button>
          </div>
          <button style={s.nextBtn} onClick={next} disabled={initiativeOrder.length === 0}>
            Next Turn →
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  list: { flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  empty: { color: '#555', fontSize: 13, fontStyle: 'italic', margin: 'auto' },
  entry: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
    background: '#0f1a30', borderRadius: 5, fontSize: 13, color: '#bbb',
  },
  active: { background: '#3a1040', color: '#fff', outline: '1px solid #b088f9' },
  badge: {
    minWidth: 28, textAlign: 'center', fontWeight: 'bold',
    background: '#0a0a1a', borderRadius: 4, padding: '2px 4px', fontSize: 12, color: '#4a90d9',
  },
  entryName: { flex: 1 },
  del: {
    background: 'transparent', border: 'none', color: '#555',
    cursor: 'pointer', fontSize: 11, padding: '2px 4px',
  },
  controls: { borderTop: '1px solid #222', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  addRow: { display: 'flex', gap: 5 },
  input: {
    background: '#0a0a1a', color: '#eee', border: '1px solid #333',
    borderRadius: 4, padding: '6px 8px', fontSize: 13,
  },
  addBtn: {
    background: '#4a90d9', color: '#fff', border: 'none',
    borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold',
  },
  nextBtn: {
    background: '#e94560', color: '#fff', border: 'none',
    borderRadius: 4, padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: 13,
  },
};
