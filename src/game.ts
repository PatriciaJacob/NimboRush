import { Grid } from './grid';
import { Player } from './entities/player';
import { S3Bucket } from './entities/s3Bucket';
import { Hole } from './entities/hole';
import { Goal } from './entities/goal';
import { InputHandler } from './input';
import { LEVELS } from './levels';
import { Wall } from './entities/wall';
import { StepFunctions } from './entities/stepFunctions';
import { SteppingStone } from './entities/steppingStone';
import { PaperFile } from './entities/paperFile';
import { Inventory } from './inventory';
import { CollisionManager } from './collisionManager';
import { AudioManager } from './audioManager';
import { MovementManager } from './movementManager';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private inventory: Inventory | null;
  private player: Player;
  private s3Buckets: S3Bucket[];
  private stepFunctions: StepFunctions[];
  private holes: Hole[];
  private steppingStones: SteppingStone[];
  private goals: Goal[];
  private walls: Wall[];
  private files: PaperFile[];
  private inputHandler: InputHandler;
  private collisionManager: CollisionManager;
  private movementManager: MovementManager;
  private lastFrameTime: number = 0;
  private isGameWon: boolean = false;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private currentLevelIndex: number = 0;
  private tileSize: number = 48;
  private audioManager: AudioManager;
  private messageOverlay: HTMLElement;
  private messageTitle: HTMLElement;
  private messageSubtitle: HTMLElement;
  private levelText: HTMLElement;
  private pauseOverlay: HTMLElement;
  private soundToggleBtn: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Get message overlay elements
    this.messageOverlay = document.getElementById('message-overlay')!;
    this.messageTitle = document.getElementById('message-title')!;
    this.messageSubtitle = document.getElementById('message-subtitle')!;
    this.levelText = document.getElementById('level-text')!;
    this.pauseOverlay = document.getElementById('pause-overlay')!;
    this.soundToggleBtn = document.getElementById('sound-toggle')!;

    // Setup sound toggle click handler
    this.soundToggleBtn.addEventListener('click', () => this.toggleMute());

    // Initialize with empty arrays (will be populated by loadLevel)
    this.s3Buckets = [];
    this.stepFunctions = [];
    this.holes = [];
    this.steppingStones = [];
    this.goals = [];
    this.walls = [];
    this.files = [];
    this.grid = new Grid(12, 10, this.tileSize); // Default grid, will be updated
    this.inventory = null; // Will be created if level has files
    this.player = new Player(0, 0, this.tileSize, 12, 10); // Temporary, will be updated

    // Initialize audio manager
    this.audioManager = new AudioManager();

    // Initialize collision manager
    this.collisionManager = new CollisionManager();

    // Initialize movement manager
    this.movementManager = new MovementManager(
      this.collisionManager,
      this.audioManager,
      12, // Default grid width, will be updated by loadLevel
      10  // Default grid height, will be updated by loadLevel
    );

    this.inputHandler = new InputHandler(this);

    // Load the first level
    this.loadLevel(0);
  }

  start(): void {
    this.audioManager.startBackgroundMusic();
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
    this.steppingStones.forEach(stone => stone.update(deltaTime));
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

    // Render stepping stones (over holes)
    this.steppingStones.forEach(stone => stone.render(this.ctx));

    // Render stepFunctions
    this.stepFunctions.forEach(stepFunction => stepFunction.render(this.ctx));

    // Render files
    this.files.forEach(file => file.render(this.ctx));

    // Render walls
    this.walls.forEach(wall => wall.render(this.ctx));

    // Render s3Buckets
    this.s3Buckets.forEach(s3Bucket => s3Bucket.render(this.ctx));

    // Render player
    this.player.render(this.ctx);

    // Render inventory (only if level has files)
    if (this.inventory) {
      this.inventory.render(this.ctx, this.player.getFilesCollected());
    }
  }

  tryMovePlayer(newX: number, newY: number): boolean {
    if (this.isGameOver || this.isGameWon) {
      return false;
    }

    return this.movementManager.tryMovePlayer(this.player, newX, newY);
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
      this.audioManager.playLevelComplete();
      this.isGameWon = true;
      this.showWinMessage();
      console.log('🎉 You won!');
    }
  }

  private checkGameOverCondition(): void {
    const playerX = this.player.getGridX();
    const playerY = this.player.getGridY();

    // Use collision manager to check if player would fall into a hole
    if (
      this.collisionManager.wouldFallIntoHole(playerX, playerY) &&
      !this.isGameOver &&
      !this.player.isFallingIntoHole()
    ) {
      // Start the falling animation
      this.player.startFalling();

      // Delay game over until animation completes (1.5 seconds)
      setTimeout(() => {
        this.isGameOver = true;
        this.showGameOverMessage();
        console.log('Game over! You ran into a hole!');
      }, 1500);
    }
  }

  private showWinMessage(): void {
    this.messageTitle.className = 'message-title win';

    // Show different message based on if there's a next level
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.messageTitle.textContent = 'LEVEL COMPLETE!';
      this.messageSubtitle.textContent = 'Press N for next level or R to restart';
    } else {
      this.messageTitle.textContent = 'YOU WIN!';
      this.messageSubtitle.textContent = 'All levels complete! Press R to restart';
    }

    this.messageOverlay.classList.add('show');
  }

  private showGameOverMessage(): void {
    this.messageTitle.textContent = 'GAME OVER!';
    this.messageTitle.className = 'message-title game-over';
    this.messageSubtitle.textContent = 'Press R to restart';

    this.messageOverlay.classList.add('show');
  }

  private hideMessage(): void {
    this.messageOverlay.classList.remove('show');
  }

  loadLevel(levelIndex: number): void {
    if (levelIndex < 0 || levelIndex >= LEVELS.length) {
      console.error('Invalid level index:', levelIndex);
      return;
    }

    const levelData = LEVELS[levelIndex];
    this.currentLevelIndex = levelIndex;
    this.isGameWon = false;

    // Only create inventory if level has files
    const hasFiles = levelData.files && levelData.files.length > 0;
    this.inventory = hasFiles
      ? new Inventory(levelData.gridWidth, this.tileSize, levelData.gridHeight)
      : null;

    // Update canvas size based on level (include inventory space only if level has files)
    const inventoryHeight = this.inventory ? this.inventory.getHeight() : 0;
    this.canvas.width = levelData.gridWidth * this.tileSize;
    this.canvas.height = levelData.gridHeight * this.tileSize + inventoryHeight;

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
        b =>
          new S3Bucket(
            b.x,
            b.y,
            this.tileSize,
            levelData.gridWidth,
            levelData.gridHeight,
            b.capacity
          )
      ) || [];

    // Recreate stepFunctions
    this.stepFunctions =
      levelData.stepFunctions?.map(b => new StepFunctions(b.x, b.y, this.tileSize)) || [];

    // Recreate holes
    this.holes = levelData.holes?.map(h => new Hole(h.x, h.y, this.tileSize)) || [];

    // Create stepping stones for each hole (invisible initially)
    this.steppingStones = this.holes.map(
      h => new SteppingStone(h.getGridX(), h.getGridY(), this.tileSize)
    );

    this.files = levelData.files?.map(f => new PaperFile(f.x, f.y, this.tileSize)) || [];

    // Recreate walls
    this.walls = levelData.walls?.map(w => new Wall(w.x, w.y, this.tileSize)) || [];

    // Recreate goals
    this.goals = levelData.goals.map(g => new Goal(g.x, g.y, this.tileSize, g.type || 's3bucket'));

    // Register all entities with collision manager
    this.collisionManager.clearAll();
    this.collisionManager.registerEntity(this.player);
    this.s3Buckets.forEach(bucket => this.collisionManager.registerEntity(bucket));
    this.walls.forEach(wall => this.collisionManager.registerEntity(wall));
    this.holes.forEach(hole => this.collisionManager.registerEntity(hole));
    this.steppingStones.forEach(stone => this.collisionManager.registerEntity(stone));
    this.stepFunctions.forEach(sf => this.collisionManager.registerEntity(sf));
    this.files.forEach(file => this.collisionManager.registerEntity(file));
    this.goals.forEach(goal => this.collisionManager.registerEntity(goal));

    // Update movement manager with new level dimensions and entities
    this.movementManager.setGridDimensions(levelData.gridWidth, levelData.gridHeight);
    this.movementManager.setSteppingStones(this.steppingStones);

    // Update level text
    this.levelText.textContent = levelData.levelText || '';

    console.log(`Loaded Level ${levelData.id}: ${levelData.name}`);
  }

  restart(): void {
    this.hideMessage();
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

    this.hideMessage();

    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      console.log('No more levels! You beat the game!');
    }
  }

  togglePause(): void {
    // Don't allow pausing during game over or win states
    if (this.isGameOver || this.isGameWon) {
      return;
    }

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseOverlay.classList.add('show');
    } else {
      this.pauseOverlay.classList.remove('show');
    }
  }

  toggleMute(): void {
    const isMuted = this.audioManager.toggleMute();
    this.soundToggleBtn.textContent = isMuted ? '🔇 Sound Off' : '🔊 Sound On';
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }
}
