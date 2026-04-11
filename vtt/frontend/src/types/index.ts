export interface User {
  id: string;
  username: string;
  role: 'gm' | 'player';
}

export interface Token {
  id: string;
  x: number;
  y: number;
  name: string;
  color: string;
  ownerId: string;
  visible: boolean;
}

export interface Room {
  id: string;
  name: string;
  gmId: string;
  mapUrl?: string;
  gridSize: number;
  tokens: Token[];
}

export interface DiceResult {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  whisperTo?: string;
  diceResult?: DiceResult;
}

export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  hp?: number;
  maxHp?: number;
}

export interface FogTile {
  x: number;
  y: number;
  revealed: boolean;
}
