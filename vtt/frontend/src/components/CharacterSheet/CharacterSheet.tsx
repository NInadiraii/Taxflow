import React, { useState } from 'react';

interface Sheet {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  notes: string;
}

const defaults: Sheet = {
  name: '', class: '', level: 1,
  hp: 10, maxHp: 10, ac: 10,
  str: 10, dex: 10, con: 10,
  int: 10, wis: 10, cha: 10,
  notes: '',
};

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

export function CharacterSheet() {
  const [sheet, setSheet] = useState<Sheet>(defaults);

  const set = <K extends keyof Sheet>(k: K, v: Sheet[K]) =>
    setSheet((prev) => ({ ...prev, [k]: v }));

  const num = (k: keyof Sheet) => (
    <input
      style={s.numInput}
      type="number"
      value={sheet[k] as number}
      onChange={(e) => set(k, (parseInt(e.target.value) || 0) as Sheet[typeof k])}
    />
  );

  const stat = (label: string, k: keyof Sheet) => (
    <div style={s.stat} key={label}>
      <span style={s.statLabel}>{label}</span>
      {num(k)}
      <span style={s.mod}>{mod(sheet[k] as number)}</span>
    </div>
  );

  const hpPct = sheet.maxHp > 0 ? (sheet.hp / sheet.maxHp) * 100 : 0;
  const hpColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#e94560';

  return (
    <div style={s.wrap}>
      <input
        style={s.nameInput}
        placeholder="Character Name"
        value={sheet.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <div style={s.row}>
        <input
          style={{ ...s.textInput, flex: 1 }}
          placeholder="Class"
          value={sheet.class}
          onChange={(e) => set('class', e.target.value)}
        />
        <label style={s.inlineLabel}>Lv</label>
        <input style={{ ...s.numInput, width: 40 }} type="number" value={sheet.level}
          onChange={(e) => set('level', parseInt(e.target.value) || 1)} />
      </div>

      {/* HP bar */}
      <div style={s.hpRow}>
        <span style={s.inlineLabel}>HP</span>
        <input style={{ ...s.numInput, width: 45 }} type="number" value={sheet.hp}
          onChange={(e) => set('hp', parseInt(e.target.value) || 0)} />
        <span style={s.inlineLabel}>/</span>
        <input style={{ ...s.numInput, width: 45 }} type="number" value={sheet.maxHp}
          onChange={(e) => set('maxHp', parseInt(e.target.value) || 0)} />
        <span style={s.inlineLabel}>AC</span>
        <input style={{ ...s.numInput, width: 40 }} type="number" value={sheet.ac}
          onChange={(e) => set('ac', parseInt(e.target.value) || 0)} />
      </div>
      <div style={s.hpBar}>
        <div style={{ ...s.hpFill, width: `${hpPct}%`, background: hpColor }} />
      </div>

      <div style={s.stats}>
        {stat('STR', 'str')}
        {stat('DEX', 'dex')}
        {stat('CON', 'con')}
        {stat('INT', 'int')}
        {stat('WIS', 'wis')}
        {stat('CHA', 'cha')}
      </div>

      <textarea
        style={s.notes}
        placeholder="Notes, spells, equipment, bonds…"
        value={sheet.notes}
        onChange={(e) => set('notes', e.target.value)}
      />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  nameInput: {
    width: '100%', background: '#0a0a1a', color: '#eee',
    border: '1px solid #555', borderRadius: 4, padding: '8px 10px',
    fontSize: 16, fontWeight: 'bold',
  },
  row: { display: 'flex', alignItems: 'center', gap: 6 },
  hpRow: { display: 'flex', alignItems: 'center', gap: 6 },
  textInput: {
    background: '#0a0a1a', color: '#eee', border: '1px solid #333',
    borderRadius: 4, padding: '5px 8px', fontSize: 13,
  },
  numInput: {
    width: 50, background: '#0a0a1a', color: '#eee', border: '1px solid #333',
    borderRadius: 4, padding: '5px 6px', fontSize: 13, textAlign: 'center',
  },
  inlineLabel: { color: '#666', fontSize: 12 },
  hpBar: { height: 5, background: '#111', borderRadius: 3, overflow: 'hidden' },
  hpFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s, background 0.3s' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  stat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: '#0a0a1a', borderRadius: 6, padding: '8px 4px', gap: 3,
  },
  statLabel: { color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  mod: { color: '#4a90d9', fontSize: 12 },
  notes: {
    background: '#0a0a1a', color: '#ccc', border: '1px solid #333',
    borderRadius: 4, padding: '8px 10px', fontSize: 13,
    minHeight: 90, resize: 'vertical', width: '100%',
  },
};
