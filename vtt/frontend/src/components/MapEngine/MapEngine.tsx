import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import Konva from 'konva';
import { useGameStore } from '../../store/gameStore';
import { TokenLayer } from '../TokenSystem/TokenLayer';
import { FogLayer } from '../FogOfWar/FogLayer';
import { getSocket } from '../../socket/client';

const GRID_SIZE = 50;

interface MapEngineProps {
  width: number;
  height: number;
}

export function MapEngine({ width, height }: MapEngineProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const { role, revealFog } = useGameStore();

  const cols = Math.ceil(width / GRID_SIZE / scale) + 2;
  const rows = Math.ceil(height / GRID_SIZE / scale) + 2;

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.max(0.25, Math.min(4, scale + direction * 0.1));

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / scale,
        y: (pointer.y - stagePos.y) / scale,
      };

      setScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [scale, stagePos]
  );

  const handleFogClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (role !== 'gm') return;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const gridX = Math.floor((pos.x - stagePos.x) / (GRID_SIZE * scale));
      const gridY = Math.floor((pos.y - stagePos.y) / (GRID_SIZE * scale));

      revealFog(gridX, gridY);
      getSocket().emit('fog:reveal', { x: gridX, y: gridY });
    },
    [role, stagePos, scale, revealFog]
  );

  const gridLines: React.ReactNode[] = [];
  for (let i = 0; i <= cols; i++) {
    gridLines.push(
      <Line
        key={`v${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, rows * GRID_SIZE]}
        stroke="#2a2a4a"
        strokeWidth={1}
      />
    );
  }
  for (let i = 0; i <= rows; i++) {
    gridLines.push(
      <Line
        key={`h${i}`}
        points={[0, i * GRID_SIZE, cols * GRID_SIZE, i * GRID_SIZE]}
        stroke="#2a2a4a"
        strokeWidth={1}
      />
    );
  }

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      x={stagePos.x}
      y={stagePos.y}
      draggable
      onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
      onWheel={handleWheel}
      onClick={handleFogClick}
      style={{ cursor: 'grab' }}
    >
      {/* Background + grid */}
      <Layer>
        <Rect
          x={0}
          y={0}
          width={cols * GRID_SIZE}
          height={rows * GRID_SIZE}
          fill="#1e1e3a"
        />
        {gridLines}
      </Layer>

      {/* Tokens */}
      <TokenLayer gridSize={GRID_SIZE} />

      {/* Fog of war */}
      <FogLayer gridSize={GRID_SIZE} cols={cols} rows={rows} />
    </Stage>
  );
}
