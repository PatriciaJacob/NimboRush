import { Player } from './entities/player';
import { S3Bucket } from './entities/s3Bucket';
import { StepFunctions } from './entities/stepFunctions';
import { SteppingStone } from './entities/steppingStone';
import { PaperFile } from './entities/paperFile';
import { CollisionManager } from './collisionManager';
import { EntityType } from './entities/entity';
import { AudioManager } from './audioManager';
import { MOVE_SPEED } from './constants';

export class MovementManager {
  private collisionManager: CollisionManager;
  private audioManager: AudioManager;
  private gridWidth: number;
  private gridHeight: number;

  // References to game entities that need to be updated on movement
  private steppingStones: SteppingStone[] = [];

  constructor(
    collisionManager: CollisionManager,
    audioManager: AudioManager,
    gridWidth: number,
    gridHeight: number
  ) {
    this.collisionManager = collisionManager;
    this.audioManager = audioManager;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  setGridDimensions(width: number, height: number): void {
    this.gridWidth = width;
    this.gridHeight = height;
  }

  setSteppingStones(stones: SteppingStone[]): void {
    this.steppingStones = stones;
  }

  tryMovePlayer(player: Player, newX: number, newY: number): boolean {
    // Don't allow movement if player is already moving
    if (player.isCurrentlyMoving()) {
      return false;
    }

    // Use collision manager to check if player can move
    const moveCheck = this.collisionManager.canPlayerMoveTo(player, newX, newY);

    if (!moveCheck.canMove) {
      return this.handleBlockedMovement(player, newX, newY, moveCheck);
    }

    // Play movement sound
    this.audioManager.playPlayerMove();

    // Handle step functions at target
    this.handleStepFunctionAtPosition(newX, newY);

    // Handle file collection at target
    this.handleFileCollectionAtPosition(player, newX, newY);

    // Move player
    player.moveTo(newX, newY);
    return true;
  }

  private handleBlockedMovement(
    player: Player,
    newX: number,
    newY: number,
    moveCheck: { canMove: boolean; needsPush?: any; reason?: string }
  ): boolean {
    // Handle different rejection reasons
    if (moveCheck.reason === 'wall') {
      this.audioManager.playInvalidMove();
      return false;
    }

    if (moveCheck.reason === 'deposit_file' && moveCheck.needsPush) {
      // Deposit a file into the bucket
      const bucket = moveCheck.needsPush as S3Bucket;
      if (player.depositFile()) {
        bucket.addFile();
      }
      return false; // Don't move player when depositing
    }

    if (moveCheck.reason === 'push_bucket' && moveCheck.needsPush) {
      // Try to push the bucket
      const bucket = moveCheck.needsPush as S3Bucket;
      const dx = newX - player.getGridX();
      const dy = newY - player.getGridY();

      if (this.tryPushS3Bucket(bucket, dx, dy)) {
        // Bucket was pushed successfully, move player
        player.moveTo(newX, newY);
        return true;
      } else {
        this.audioManager.playInvalidMove();
        return false;
      }
    }

    if (moveCheck.reason === 'unpushable_bucket') {
      this.audioManager.playInvalidMove();
      return false;
    }

    // Other blocking reasons
    this.audioManager.playInvalidMove();
    return false;
  }

  private handleStepFunctionAtPosition(x: number, y: number): void {
    const stepFunctionAtTarget = this.collisionManager.getEntityAt<StepFunctions>(
      x,
      y,
      EntityType.STEP_FUNCTIONS
    );

    if (stepFunctionAtTarget && stepFunctionAtTarget.isConsumable()) {
      stepFunctionAtTarget.consume();
      // Activate all stepping stones
      this.steppingStones.forEach(stone => stone.activate());
    }
  }

  private handleFileCollectionAtPosition(player: Player, x: number, y: number): void {
    const fileAtTarget = this.collisionManager.getEntityAt<PaperFile>(
      x,
      y,
      EntityType.PAPER_FILE
    );

    if (fileAtTarget && fileAtTarget.isConsumable()) {
      fileAtTarget.consume();
      player.collectFile();
    }
  }

  tryPushS3Bucket(s3Bucket: S3Bucket, dx: number, dy: number): boolean {
    // Don't push if s3Bucket is already moving
    if (s3Bucket.isCurrentlyMoving()) {
      return false;
    }

    if (!s3Bucket.isFull()) {
      return false;
    }

    const newS3BucketX = s3Bucket.getGridX() + dx;
    const newS3BucketY = s3Bucket.getGridY() + dy;

    // Check bounds
    if (
      newS3BucketX < 0 ||
      newS3BucketX >= this.gridWidth ||
      newS3BucketY < 0 ||
      newS3BucketY >= this.gridHeight
    ) {
      this.audioManager.playInvalidMove();
      return false;
    }

    // Use collision manager to check if bucket can be pushed to new position
    if (!this.collisionManager.canPushEntityTo(s3Bucket, newS3BucketX, newS3BucketY)) {
      this.audioManager.playInvalidMove();
      return false;
    }

    // Move the bucket
    s3Bucket.moveTo(newS3BucketX, newS3BucketY);

    // Check if the bucket would fall into a hole
    if (this.collisionManager.wouldFallIntoHole(newS3BucketX, newS3BucketY)) {
      // Calculate approximate movement duration based on move speed
      const movementDuration = (1 / MOVE_SPEED) * 1000;
      setTimeout(() => {
        s3Bucket.startFalling();
      }, movementDuration);
    }

    return true;
  }
}
