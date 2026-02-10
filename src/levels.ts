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
    id: 2,
    name: 'Basic',
    gridWidth: 3,
    gridHeight: 5,
    playerStart: {
      x: 0,
      y: 0,
    },
    goals: [
      {
        x: 1,
        y: 3,
      },
      {
        x: 2,
        y: 4,
      },
      {
        x: 2,
        y: 3,
      },
    ],
    levelText: 'You may need to deploy multiple S3 buckets',
    s3Buckets: [
      {
        x: 1,
        y: 2,
      },
      {
        x: 2,
        y: 1,
      },
      {
        x: 1,
        y: 1,
      },
    ],
  },
  {
    id: 3,
    name: 'Tutorial 2',
    gridWidth: 6,
    gridHeight: 3,
    playerStart: {
      x: 0,
      y: 0,
    },
    goals: [
      {
        x: 5,
        y: 2,
      },
    ],
    levelText:
      'And sometimes even fill your bucket with the necessary files before deploying it...',
    walls: [
      {
        x: 1,
        y: 0,
      },
      {
        x: 1,
        y: 1,
      },
      {
        x: 3,
        y: 1,
      },
      {
        x: 4,
        y: 1,
      },
      {
        x: 5,
        y: 1,
      },
      {
        x: 5,
        y: 0,
      },
    ],
    files: [
      {
        x: 4,
        y: 0,
      },
    ],
    s3Buckets: [
      {
        x: 3,
        y: 2,
        capacity: 1,
      },
    ],
  },
  {
    id: 4,
    name: 'Basic 2',
    gridWidth: 6,
    gridHeight: 6,
    playerStart: {
      x: 0,
      y: 0,
    },
    goals: [
      {
        x: 5,
        y: 0,
      },
      {
        x: 0,
        y: 5,
      },
      {
        x: 5,
        y: 5,
      },
    ],
    levelText: 'If you ever get stuck, you can always restart by pressing R',
    walls: [
      {
        x: 1,
        y: 0,
      },
      {
        x: 1,
        y: 1,
      },
      {
        x: 0,
        y: 3,
      },
      {
        x: 1,
        y: 3,
      },
      {
        x: 2,
        y: 1,
      },
      {
        x: 4,
        y: 0,
      },
      {
        x: 4,
        y: 4,
      },
    ],
    files: [
      {
        x: 2,
        y: 0,
      },
    ],
    s3Buckets: [
      {
        x: 1,
        y: 2,
      },
      {
        x: 4,
        y: 2,
        capacity: 1,
      },
      {
        x: 4,
        y: 3,
      },
    ],
  },
  {
    id: 5,
    name: 'Tutorial holes',
    gridWidth: 5,
    gridHeight: 5,
    playerStart: {
      x: 0,
      y: 0,
    },
    goals: [
      {
        x: 4,
        y: 4,
      },
    ],
    levelText: 'Be careful to not fall into holes',
    s3Buckets: [
      {
        x: 4,
        y: 2,
      },
    ],
    holes: [
      {
        x: 1,
        y: 0,
      },
      {
        x: 1,
        y: 1,
      },
      {
        x: 1,
        y: 2,
      },
      {
        x: 1,
        y: 3,
      },
      {
        x: 3,
        y: 1,
      },
      {
        x: 3,
        y: 4,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 3,
        y: 2,
      },
    ],
  },
  {
    id: 6,
    name: 'Tutorial step functions',
    gridWidth: 5,
    gridHeight: 5,
    playerStart: {
      x: 0,
      y: 0,
    },
    goals: [
      {
        x: 4,
        y: 0,
      },
      {
        x: 4,
        y: 4,
      },
    ],
    levelText: 'But worry not because step functions... well... they create steps for you',
    walls: [
      {
        x: 3,
        y: 3,
      },
      {
        x: 1,
        y: 4,
      },
    ],
    s3Buckets: [
      {
        x: 3,
        y: 2,
      },
      {
        x: 1,
        y: 0,
      },
    ],
    holes: [
      {
        x: 1,
        y: 1,
      },
      {
        x: 2,
        y: 1,
      },
      {
        x: 1,
        y: 2,
      },
      {
        x: 2,
        y: 2,
      },
      {
        x: 1,
        y: 3,
      },
      {
        x: 2,
        y: 3,
      },
    ],
    stepFunctions: [
      {
        x: 0,
        y: 4,
      },
    ],
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
