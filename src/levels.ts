export interface LevelData {
  id: number;
  name: string;
  gridWidth: number;
  gridHeight: number;
  playerStart: { x: number; y: number };
  blocks: { x: number; y: number }[];
  goals: { x: number; y: number }[];
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "First Steps",
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 1 },
    blocks: [
      { x: 3, y: 2 },
    ],
    goals: [
      { x: 9, y: 3 },
    ],
  },
  {
    id: 2,
    name: "Double Trouble",
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 1 },
    blocks: [
      { x: 3, y: 2 },
      { x: 5, y: 4 },
    ],
    goals: [
      { x: 9, y: 3 },
      { x: 9, y: 5 },
    ],
  },
  {
    id: 3,
    name: "The Puzzle",
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 5 },
    blocks: [
      { x: 4, y: 3 },
      { x: 5, y: 5 },
      { x: 4, y: 7 },
    ],
    goals: [
      { x: 10, y: 3 },
      { x: 10, y: 5 },
      { x: 10, y: 7 },
    ],
  },
];
