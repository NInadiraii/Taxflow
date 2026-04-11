import React from 'react';
import { Layer } from 'react-konva';
import { useGameStore } from '../../store/gameStore';
import { Token } from './Token';

interface TokenLayerProps {
  gridSize: number;
}

export function TokenLayer({ gridSize }: TokenLayerProps) {
  const tokens = useGameStore((s) => s.tokens);

  return (
    <Layer>
      {tokens.map((token) => (
        <Token key={token.id} token={token} gridSize={gridSize} />
      ))}
    </Layer>
  );
}
