import React from 'react';
import { Layer, Rect } from 'react-konva';
import { useGameStore } from '../../store/gameStore';

interface FogLayerProps {
  gridSize: number;
  cols: number;
  rows: number;
}

export function FogLayer({ gridSize, cols, rows }: FogLayerProps) {
  const { fogTiles, role } = useGameStore();

  const revealed = new Set(
    fogTiles.filter((t) => t.revealed).map((t) => `${t.x},${t.y}`)
  );

  const rects: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (revealed.has(`${col},${row}`)) continue;
      rects.push(
        <Rect
          key={`${col},${row}`}
          x={col * gridSize}
          y={row * gridSize}
          width={gridSize}
          height={gridSize}
          fill={role === 'gm' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.92)'}
        />
      );
    }
  }

  return <Layer>{rects}</Layer>;
}
