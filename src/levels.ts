export interface LevelData {
  id: number;
  name: string;
  gridWidth: number;
  gridHeight: number;
  playerStart: { x: number; y: number };
  s3Buckets?: { x: number; y: number; capacity?: number }[];
  stepFunctions?: { x: number; y: number }[];
  holes?: { x: number; y: number }[];
  goals: { x: number; y: number; type?: 's3bucket' | 'player' }[];
  levelText?: string;
  walls?: { x: number; y: number }[];
  files?: { x: number; y: number }[];
}

export const LEVELS: LevelData[] = [
  // {
  //   id: 0,
  //   name: 'Tutorial',
  //   gridWidth: 7,
  //   gridHeight: 1,
  //   playerStart: { x: 0, y: 0 },
  //   levelText:
  //     'Welcome, Nimbo! Use arrow keys to reach the orange goal. Time to deploy yourself to production! 🚀',
  //   goals: [{ x: 6, y: 0, type: 'player' }],
  // },
  {
    id: 1,
    name: 'Tutorial S3',
    gridWidth: 7,
    gridHeight: 1,
    playerStart: { x: 0, y: 0 },
    s3Buckets: [{ x: 2, y: 0 }],
    levelText: "Let's deploy a S3 bucket by pushing it to the green goal.",
    goals: [{ x: 6, y: 0 }],
  },
  {
    id: 11,
    name: 'Choose Wisely',
    gridWidth: 12,
    gridHeight: 10,
    levelText:
      "Step Functions unlock the path forward, but careful - deploy files to the wrong bucket and you'll be stuck in a failed state!",
    playerStart: { x: 0, y: 0 },
    s3Buckets: [
      { x: 6, y: 5, capacity: 2 },
      { x: 4, y: 0 },
      { x: 5, y: 2 },
      { x: 2, y: 3, capacity: 1 },
    ],
    stepFunctions: [{ x: 10, y: 1 }],
    holes: [
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 1, y: 4 },
    ],
    goals: [
      { x: 10, y: 5 },
      { x: 8, y: 2 },
      { x: 2, y: 0 },
      { x: 1, y: 2 },
    ],
    files: [
      { x: 1, y: 8 },
      { x: 7, y: 0 },
      { x: 6, y: 8 },
    ],
    walls: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 0 },
      { x: 6, y: 4 },

      { x: 8, y: 3 },
      { x: 9, y: 3 },
      { x: 10, y: 3 },
      { x: 11, y: 3 },
      { x: 7, y: 3 },
      { x: 6, y: 3 },

      { x: 9, y: 5 },
      { x: 9, y: 6 },
      { x: 7, y: 6 },
      { x: 9, y: 7 },
      { x: 11, y: 9 },

      { x: 0, y: 6 },
      { x: 2, y: 6 },
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 7 },
      { x: 4, y: 8 },
      { x: 4, y: 9 },
      { x: 0, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
    ],
  },
  // {
  //   id: 12,
  //   name: 'Double Trouble',
  //   gridWidth: 12,
  //   gridHeight: 10,
  //   playerStart: { x: 1, y: 1 },
  //   s3Buckets: [
  //     { x: 3, y: 2 },
  //     { x: 5, y: 4 },
  //   ],
  //   goals: [
  //     { x: 9, y: 3 },
  //     { x: 9, y: 5 },
  //   ],
  // },
  // {
  //   id: 13,
  //   name: 'The Puzzle',
  //   gridWidth: 12,
  //   gridHeight: 10,
  //   playerStart: { x: 1, y: 5 },
  //   s3Buckets: [
  //     { x: 4, y: 3 },
  //     { x: 5, y: 5 },
  //     { x: 4, y: 7 },
  //   ],
  //   goals: [
  //     { x: 10, y: 3 },
  //     { x: 10, y: 5 },
  //     { x: 10, y: 7 },
  //   ],
  // },
];
