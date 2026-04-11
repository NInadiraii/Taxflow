import React, { useState, useCallback } from 'react';
import type { DiceResult } from '../../types';
import { getSocket } from '../../socket/client';

function rollDice(formula: string): DiceResult | null {
  const match = formula.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  if (count < 1 || count > 100 || sides < 2) return null;

  const rolls: number[] = Array.from(
    { length: count },
    () => Math.floor(Math.random() * sides) + 1
  );

  return {
    formula,
    rolls,
    modifier,
    total: rolls.reduce((s, r) => s + r, 0) + modifier,
  };
}

const PRESETS = ['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100'];

export function DiceRoller() {
  const [formula, setFormula] = useState('1d20');
  const [result, setResult] = useState<DiceResult | null>(null);
  const [error, setError] = useState('');

  const roll = useCallback(() => {
    const r = rollDice(formula);
    if (!r) {
      setError('Invalid — try: 2d6+3');
      return;
    }
    setError('');
    setResult(r);
    getSocket().emit('dice:roll', r);
  }, [formula]);

  return (
    <div style={s.wrap}>
      <p style={s.label}>Quick roll</p>
      <div style={s.presets}>
        {PRESETS.map((p) => (
          <button key={p} style={s.preset} onClick={() => { setFormula(p); setError(''); }}>
            {p}
          </button>
        ))}
      </div>

      <div style={s.row}>
        <input
          style={s.input}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && roll()}
          placeholder="2d6+3"
          spellCheck={false}
        />
        <button style={s.rollBtn} onClick={roll}>Roll</button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {result && (
        <div style={s.result}>
          <span style={s.formula}>{result.formula}</span>
          <span style={s.rolls}>[{result.rolls.join(', ')}]</span>
          {result.modifier !== 0 && (
            <span style={s.mod}>
              {result.modifier > 0 ? '+' : ''}{result.modifier}
            </span>
          )}
          <span style={s.total}>{result.total}</span>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  label: { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  presets: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  preset: {
    background: '#0f3460', color: '#ccc', border: '1px solid #333',
    borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12,
  },
  row: { display: 'flex', gap: 6 },
  input: {
    flex: 1, background: '#0a0a1a', color: '#eee',
    border: '1px solid #444', borderRadius: 4, padding: '7px 10px', fontSize: 14,
  },
  rollBtn: {
    background: '#e94560', color: '#fff', border: 'none',
    borderRadius: 4, padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: 14,
  },
  error: { color: '#e94560', fontSize: 12 },
  result: {
    background: '#0a0a1a', borderRadius: 8, padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
  },
  formula: { color: '#666', fontSize: 12 },
  rolls: { color: '#999', fontSize: 12, flex: 1 },
  mod: { color: '#4a90d9', fontSize: 14 },
  total: { color: '#ffd700', fontSize: 28, fontWeight: 'bold' },
};
