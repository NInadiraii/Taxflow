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
  gridSize: number;
  tokens: Token[];
  fogRevealed: Set<string>; // "x,y" keys
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
