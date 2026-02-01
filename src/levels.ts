export interface LevelData {
  id: number;
  name: string;
  gridWidth: number;
  gridHeight: number;
  playerStart: { x: number; y: number };
  s3Buckets?: { x: number; y: number }[];
  holes?: { x: number; y: number }[];
  goals: { x: number; y: number; type?: 's3bucket' | 'player' }[];
  levelText?: string;
}

export const LEVELS: LevelData[] = [
  {
    id: 0,
    name: 'Tutorial',
    gridWidth: 7,
    gridHeight: 1,
    playerStart: { x: 0, y: 0 },
    levelText:
      'Welcome, Nimbo! Use arrow keys to reach the orange goal. Time to deploy yourself to production! 🚀',
    goals: [{ x: 6, y: 0, type: 'player' }],
  },
  {
    id: 1,
    name: 'Tutorial S3',
    gridWidth: 7,
    gridHeight: 1,
    playerStart: { x: 0, y: 0 },
    s3Buckets: [{ x: 2, y: 0 }],
    levelText: 'Push the S3 bucket to the green goal. Storage made simple... or is it? 📦',
    goals: [{ x: 6, y: 0 }],
  },
  {
    id: 11,
    name: 'First Steps',
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 1 },
    s3Buckets: [{ x: 3, y: 2 }],
    holes: [{ x: 2, y: 2 }],
    goals: [{ x: 9, y: 3 }],
  },
  {
    id: 12,
    name: 'Double Trouble',
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 1 },
    s3Buckets: [
      { x: 3, y: 2 },
      { x: 5, y: 4 },
    ],
    goals: [
      { x: 9, y: 3 },
      { x: 9, y: 5 },
    ],
  },
  {
    id: 13,
    name: 'The Puzzle',
    gridWidth: 12,
    gridHeight: 10,
    playerStart: { x: 1, y: 5 },
    s3Buckets: [
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
