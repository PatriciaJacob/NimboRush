import { Grid } from './grid';
import { Player } from './player';
import { S3Bucket } from './s3Bucket';
import { Hole } from './hole';
import { Goal } from './goal';
import { InputHandler } from './input';
import { LEVELS, LevelData } from './levels';
import { Wall } from './wall';
import { StepFunctions } from './stepFunctions';
import { SteppingStone } from './steppingStone';
import { PaperFile } from './paperFile';
import { Inventory } from './inventory';
import { CollisionManager } from './collisionManager';
import { EntityType } from './entity';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private inventory: Inventory;
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
  private lastFrameTime: number = 0;
  private isGameWon: boolean = false;
  private isGameOver: boolean = false;
  private currentLevelIndex: number = 0;
  private tileSize: number = 48;
  private levelCompleteSound: HTMLAudioElement;
  private invalidMoveSound: HTMLAudioElement;
  private playerMoveSound: HTMLAudioElement;
  private messageOverlay: HTMLElement;
  private messageTitle: HTMLElement;
  private messageSubtitle: HTMLElement;
  private levelText: HTMLElement;

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

    // Initialize with empty arrays (will be populated by loadLevel)
    this.s3Buckets = [];
    this.stepFunctions = [];
    this.holes = [];
    this.steppingStones = [];
    this.goals = [];
    this.walls = [];
    this.files = [];
    this.grid = new Grid(12, 10, this.tileSize); // Default grid, will be updated
    this.inventory = new Inventory(12, this.tileSize, 10); // Default, will be updated
    this.player = new Player(0, 0, this.tileSize, 12, 10); // Temporary, will be updated

    // Load sounds
    this.levelCompleteSound = new Audio('src/assets/sounds/correct_answer_toy_bi-bling-476370.mp3');
    this.invalidMoveSound = new Audio('src/assets/sounds/wood-step-sample-1-47664.mp3');
    this.playerMoveSound = new Audio('src/assets/sounds/snow-step-1-81064.mp3');
    this.playerMoveSound.playbackRate = 2;

    // Initialize collision manager
    this.collisionManager = new CollisionManager();

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

    // Render inventory
    this.inventory.render(this.ctx, this.player.getFilesCollected());
  }

  tryMovePlayer(newX: number, newY: number): boolean {
    if (this.isGameOver || this.isGameWon) {
      return false;
    }

    // Don't allow movement if player is already moving
    if (this.player.isCurrentlyMoving()) {
      return false;
    }

    // Use collision manager to check if player can move
    const moveCheck = this.collisionManager.canPlayerMoveTo(this.player, newX, newY);

    if (!moveCheck.canMove) {
      // Handle different rejection reasons
      if (moveCheck.reason === 'wall') {
        this.invalidMoveSound.currentTime = 0;
        this.invalidMoveSound.play();
        return false;
      }

      if (moveCheck.reason === 'deposit_file' && moveCheck.needsPush) {
        // Deposit a file into the bucket
        const bucket = moveCheck.needsPush as S3Bucket;
        if (this.player.depositFile()) {
          bucket.addFile();
        }
        return false; // Don't move player when depositing
      }

      if (moveCheck.reason === 'push_bucket' && moveCheck.needsPush) {
        // Try to push the bucket
        const bucket = moveCheck.needsPush as S3Bucket;
        const dx = newX - this.player.getGridX();
        const dy = newY - this.player.getGridY();

        if (this.tryPushs3Bucket(bucket, dx, dy)) {
          // Bucket was pushed successfully, move player
          this.player.moveTo(newX, newY);
          return true;
        } else {
          this.invalidMoveSound.currentTime = 0;
          this.invalidMoveSound.play();
          return false;
        }
      }

      if (moveCheck.reason === 'unpushable_bucket') {
        this.invalidMoveSound.currentTime = 0;
        this.invalidMoveSound.play();
        return false;
      }

      // Other blocking reasons
      this.invalidMoveSound.currentTime = 0;
      this.invalidMoveSound.play();
      return false;
    }

    // Movement is allowed - play sound and handle interactions
    this.playerMoveSound.currentTime = 0;
    this.playerMoveSound.play();

    // Check for step functions to activate
    const stepFunctionAtTarget = this.collisionManager.getEntityAt<StepFunctions>(
      newX,
      newY,
      EntityType.STEP_FUNCTIONS
    );

    if (stepFunctionAtTarget && stepFunctionAtTarget.isConsumable()) {
      stepFunctionAtTarget.consume();
      // Activate all stepping stones
      this.steppingStones.forEach(stone => stone.activate());
    }

    // Check for files to collect
    const fileAtTarget = this.collisionManager.getEntityAt<PaperFile>(
      newX,
      newY,
      EntityType.PAPER_FILE
    );

    if (fileAtTarget && fileAtTarget.isConsumable()) {
      fileAtTarget.consume();
      this.player.collectFile();
    }

    // Move player
    this.player.moveTo(newX, newY);
    return true;
  }

  private tryPushs3Bucket(s3Bucket: S3Bucket, dx: number, dy: number): boolean {
    // Don't push if s3Bucket is already moving
    if (s3Bucket.isCurrentlyMoving()) {
      return false;
    }

    if (!s3Bucket.isFull()) {
      return false;
    }

    const news3BucketX = s3Bucket.getGridX() + dx;
    const news3BucketY = s3Bucket.getGridY() + dy;

    // Check bounds
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

    // Use collision manager to check if bucket can be pushed to new position
    if (!this.collisionManager.canPushEntityTo(s3Bucket, news3BucketX, news3BucketY)) {
      this.invalidMoveSound.currentTime = 0;
      this.invalidMoveSound.play();
      return false;
    }

    // Move the bucket
    s3Bucket.moveTo(news3BucketX, news3BucketY);

    // Check if the bucket would fall into a hole
    if (this.collisionManager.wouldFallIntoHole(news3BucketX, news3BucketY)) {
      // Calculate approximate movement duration based on move speed (8 tiles per second)
      const movementDuration = (1 / 8) * 1000; // ~125ms
      setTimeout(() => {
        s3Bucket.startFalling();
      }, movementDuration);
    }

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

    // Recreate inventory
    this.inventory = new Inventory(levelData.gridWidth, this.tileSize, levelData.gridHeight);

    // Update canvas size based on level (including inventory space)
    this.canvas.width = levelData.gridWidth * this.tileSize;
    this.canvas.height = levelData.gridHeight * this.tileSize + this.inventory.getHeight();

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
}
