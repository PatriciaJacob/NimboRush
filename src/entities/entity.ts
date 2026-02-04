export enum EntityType {
  PLAYER = 'player',
  S3_BUCKET = 's3_bucket',
  WALL = 'wall',
  HOLE = 'hole',
  STEPPING_STONE = 'stepping_stone',
  STEP_FUNCTIONS = 'step_functions',
  PAPER_FILE = 'paper_file',
  GOAL = 'goal',
}

export interface Entity {
  getGridX(): number;
  getGridY(): number;
  getEntityType(): EntityType;

  /** Does this entity block other entities from entering this tile? */
  blocksMovement(): boolean;
  canBePushed?(): boolean; // Can this entity be pushed by the player?
  isCurrentlyMoving?(): boolean; // Is this entity currently animating movement?

  // Interaction callbacks
  onPlayerEnter?(): boolean; // Called when player enters this tile. Return false to block movement.
  onPlayerPush?(): boolean; // Called when player tries to push. Return false to block push.
}
