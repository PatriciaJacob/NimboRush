import { Grid } from './grid';
import { Player } from './player';
import { S3Bucket } from './s3Bucket';
import { Hole } from './hole';
import { Goal } from './goal';
import { InputHandler } from './input';
import { LEVELS, LevelData } from './levels';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private player: Player;
  private s3Buckets: S3Bucket[];
  private holes: Hole[];
  private goals: Goal[];
  private inputHandler: InputHandler;
  private lastFrameTime: number = 0;
  private isGameWon: boolean = false;
  private isGameOver: boolean = false;
  private currentLevelIndex: number = 0;
  private tileSize: number = 48;
  private levelCompleteSound: HTMLAudioElement;
  private invalidMoveSound: HTMLAudioElement;
  private playerMoveSound: HTMLAudioElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Initialize with empty arrays (will be populated by loadLevel)
    this.s3Buckets = [];
    this.holes = [];
    this.goals = [];
    this.grid = new Grid(12, 10, this.tileSize); // Default grid, will be updated
    this.player = new Player(0, 0, this.tileSize, 12, 10); // Temporary, will be updated

    // Load sounds
    this.levelCompleteSound = new Audio('src/sounds/correct_answer_toy_bi-bling-476370.mp3');
    this.invalidMoveSound = new Audio('src/sounds/wood-step-sample-1-47664.mp3');
    this.playerMoveSound = new Audio('src/sounds/snow-step-1-81064.mp3');
    this.playerMoveSound.playbackRate = 2;

    this.inputHandler = new InputHandler(this);

    // Load the first level
    this.loadLevel(0);
  }

  start(): void {
    this.gameLoop(0);
  }

  private gameLoop = (timestamp: number): void => {
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.player.update(deltaTime);
    this.s3Buckets.forEach(s3Bucket => s3Bucket.update(deltaTime));
    this.checkWinCondition();
    this.checkGameOverCondition();
  }

  private render(): void {
    // Clear canvas with a soft neutral background
    this.ctx.fillStyle = '#2d2d30';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render grid
    this.grid.render(this.ctx);

    // Render goals (behind s3Buckets)
    this.goals.forEach(goal => goal.render(this.ctx));

    // Render holes
    this.holes.forEach(hole => hole.render(this.ctx));

    // Render s3Buckets
    this.s3Buckets.forEach(s3Bucket => s3Bucket.render(this.ctx));

    // Render player
    this.player.render(this.ctx);

    // Render win message
    if (this.isGameWon) {
      this.renderWinMessage();
    }

    if (this.isGameOver) {
      this.renderGameOverMessage();
    }
  }

  tryMovePlayer(newX: number, newY: number): boolean {
    if (this.isGameOver || this.isGameWon) {
      return false;
    }

    // Don't allow movement if player is already moving
    if (this.player.isCurrentlyMoving()) {
      return false;
    }

    // Check if there's a s3Bucket at the target position
    const s3BucketAtTarget = this.s3Buckets.find(
      s3Bucket => s3Bucket.getGridX() === newX && s3Bucket.getGridY() === newY
    );

    if (s3BucketAtTarget) {
      // Calculate push direction
      const dx = newX - this.player.getGridX();
      const dy = newY - this.player.getGridY();

      // Try to push the s3Bucket
      if (this.tryPushs3Bucket(s3BucketAtTarget, dx, dy)) {
        // s3Bucket was pushed successfully, move player
        this.player.moveTo(newX, newY);
        return true;
      } else {
        this.invalidMoveSound.currentTime = 0;
        this.invalidMoveSound.play();
        // s3Bucket couldn't be pushed, don't move player
        return false;
      }
    }

    this.playerMoveSound.currentTime = 0;
    this.playerMoveSound.play();

    // No s3Bucket in the way, just move player
    this.player.moveTo(newX, newY);
    return true;
  }

  private tryPushs3Bucket(s3Bucket: S3Bucket, dx: number, dy: number): boolean {
    // Don't push if s3Bucket is already moving
    if (s3Bucket.isCurrentlyMoving()) {
      return false;
    }

    const news3BucketX = s3Bucket.getGridX() + dx;
    const news3BucketY = s3Bucket.getGridY() + dy;

    // If the s3Bucket would go out of bounds player can't push it
    if (
      news3BucketX < 0 ||
      news3BucketX >= this.grid.getWidth() ||
      news3BucketY < 0 ||
      news3BucketY >= this.grid.getHeight()
    ) {
      this.invalidMoveSound.currentTime = 0;
      this.invalidMoveSound.play();
      return false;
    }

    // Check if another s3Bucket is s3Bucketing the push
    const s3Bucketings3Bucket = this.s3Buckets.find(
      b => b !== s3Bucket && b.getGridX() === news3BucketX && b.getGridY() === news3BucketY
    );

    if (s3Bucketings3Bucket) {
      return false; // Another s3Bucket is in the way
    }

    // Move the s3Bucket (it will do its own bounds checking)
    s3Bucket.moveTo(news3BucketX, news3BucketY);
    return true;
  }

  getPlayer(): Player {
    return this.player;
  }

  private checkWinCondition(): void {
    // Check if all goals are completed based on their type
    let allGoalsCompleted = true;

    for (const goal of this.goals) {
      if (goal.getType() === 'player') {
        // Player goal - check if player is on it
        const playerOnGoal =
          this.player.getGridX() === goal.getGridX() && this.player.getGridY() === goal.getGridY();

        if (playerOnGoal) {
          goal.setCompleted(true);
        } else {
          goal.setCompleted(false);
          allGoalsCompleted = false;
        }
      } else {
        // S3 bucket goal - check if an S3 bucket is on it
        const s3BucketOnGoal = this.s3Buckets.find(
          s3Bucket =>
            s3Bucket.getGridX() === goal.getGridX() && s3Bucket.getGridY() === goal.getGridY()
        );

        if (s3BucketOnGoal) {
          goal.setCompleted(true);
        } else {
          goal.setCompleted(false);
          allGoalsCompleted = false;
        }
      }
    }

    if (allGoalsCompleted && !this.isGameWon) {
      this.levelCompleteSound.currentTime = 0;
      this.levelCompleteSound.play();
      this.isGameWon = true;
      console.log('🎉 You won!');
    }
  }

  private checkGameOverCondition(): void {
    const playerInHole = this.holes?.find(
      hole =>
        hole.getGridX() === this.player.getGridX() && hole.getGridY() === this.player.getGridY()
    );

    if (playerInHole && !this.isGameOver && !this.player.isFallingIntoHole()) {
      // Start the falling animation
      this.player.startFalling();

      // Delay game over until animation completes (2.5 seconds)
      setTimeout(() => {
        this.isGameOver = true;
        console.log('Game over! You ran into a hole!');
      }, 1500);
    }
  }

  private renderWinMessage(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Win message
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 30);

    // Subtitle
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '24px monospace';

    // Show different message based on if there's a next level
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.ctx.fillText(
        'Press N for next level or R to restart',
        this.canvas.width / 2,
        this.canvas.height / 2 + 30
      );
    } else {
      this.ctx.fillText(
        'All levels complete! Press R to restart',
        this.canvas.width / 2,
        this.canvas.height / 2 + 30
      );
    }
  }

  private renderGameOverMessage(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Game over message
    this.ctx.fillStyle = '#cc5b2e';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 30);

    // Subtitle
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '24px monospace';

    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
  }

  loadLevel(levelIndex: number): void {
    if (levelIndex < 0 || levelIndex >= LEVELS.length) {
      console.error('Invalid level index:', levelIndex);
      return;
    }

    const levelData = LEVELS[levelIndex];
    this.currentLevelIndex = levelIndex;
    this.isGameWon = false;

    // Update canvas size based on level
    this.canvas.width = levelData.gridWidth * this.tileSize;
    this.canvas.height = levelData.gridHeight * this.tileSize;

    // Recreate grid
    this.grid = new Grid(levelData.gridWidth, levelData.gridHeight, this.tileSize);

    // Recreate player
    this.player = new Player(
      levelData.playerStart.x,
      levelData.playerStart.y,
      this.tileSize,
      levelData.gridWidth,
      levelData.gridHeight
    );

    // Recreate s3Buckets
    this.s3Buckets =
      levelData.s3Buckets?.map(
        b => new S3Bucket(b.x, b.y, this.tileSize, levelData.gridWidth, levelData.gridHeight)
      ) || [];

    // Recreate holes
    this.holes = levelData.holes?.map(h => new Hole(h.x, h.y, this.tileSize)) || [];

    // Recreate goals
    this.goals = levelData.goals.map(g => new Goal(g.x, g.y, this.tileSize, g.type || 's3bucket'));

    console.log(`Loaded Level ${levelData.id}: ${levelData.name}`);
  }

  restart(): void {
    this.isGameOver = false;
    // if the game has ended, player passed all levels, reset to first level
    if (this.isGameWon) {
      this.loadLevel(0);
      return;
    }
    // otherwise, restart the current level
    this.loadLevel(this.currentLevelIndex);
  }

  nextLevel(): void {
    // don't let the user to next level if they haven't beaten current level
    if (!this.isGameWon) {
      return;
    }

    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      console.log('No more levels! You beat the game!');
    }
  }
}
