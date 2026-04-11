import React, { useCallback } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';
import type { Token as TokenType } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { getSocket } from '../../socket/client';

interface TokenProps {
  token: TokenType;
  gridSize: number;
}

export function Token({ token, gridSize }: TokenProps) {
  const { moveToken, userId, role } = useGameStore();
  const canDrag = role === 'gm' || token.ownerId === userId;

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // Snap to grid
      const x = Math.round(e.target.x() / gridSize) * gridSize;
      const y = Math.round(e.target.y() / gridSize) * gridSize;
      e.target.position({ x, y });

      moveToken(token.id, x, y);
      getSocket().emit('token:move', { tokenId: token.id, x, y });
    },
    [token.id, gridSize, moveToken]
  );

  const initial = token.name.charAt(0).toUpperCase();
  const isOwn = token.ownerId === userId;

  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={canDrag}
      onDragEnd={handleDragEnd}
    >
      {/* Shadow */}
      <Rect
        x={3}
        y={3}
        width={gridSize - 4}
        height={gridSize - 4}
        fill="rgba(0,0,0,0.4)"
        cornerRadius={6}
      />
      {/* Token body */}
      <Rect
        width={gridSize - 4}
        height={gridSize - 4}
        fill={token.color}
        cornerRadius={6}
        stroke={isOwn ? '#ffd700' : '#555'}
        strokeWidth={isOwn ? 2 : 1}
      />
      {/* Initial letter */}
      <Text
        text={initial}
        fontSize={Math.floor(gridSize * 0.45)}
        fill="#fff"
        width={gridSize - 4}
        height={gridSize - 4}
        align="center"
        verticalAlign="middle"
        fontStyle="bold"
      />
      {/* Owner indicator dot */}
      {isOwn && (
        <Circle x={gridSize - 10} y={8} radius={4} fill="#ffd700" />
      )}
    </Group>
  );
}
