import { Grid } from './grid';
import { Player } from './player';
import { Block } from './block';
import { Hole } from './hole';
import { Goal } from './goal';
import { InputHandler } from './input';
import { LEVELS, LevelData } from './levels';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private player: Player;
  private blocks: Block[];
  private holes: Hole[];
  private goals: Goal[];
  private inputHandler: InputHandler;
  private lastFrameTime: number = 0;
  private isGameWon: boolean = false;
  private isGameOver: boolean = false;
  private currentLevelIndex: number = 0;
  private tileSize: number = 48;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Initialize with empty arrays (will be populated by loadLevel)
    this.blocks = [];
    this.holes = [];
    this.goals = [];
    this.grid = new Grid(12, 10, this.tileSize); // Default grid, will be updated
    this.player = new Player(0, 0, this.tileSize, 12, 10); // Temporary, will be updated

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
    this.blocks.forEach(block => block.update(deltaTime));
    this.checkWinCondition();
    this.checkGameOverCondition();
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render grid
    this.grid.render(this.ctx);

    // Render goals (behind blocks)
    this.goals.forEach(goal => goal.render(this.ctx));

    // Render holes
    this.holes.forEach(hole => hole.render(this.ctx));

    // Render blocks
    this.blocks.forEach(block => block.render(this.ctx));

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
    // Don't allow movement if player is already moving
    if (this.player.isCurrentlyMoving()) {
      return false;
    }

    // Check if there's a block at the target position
    const blockAtTarget = this.blocks.find(
      block => block.getGridX() === newX && block.getGridY() === newY
    );

    if (blockAtTarget) {
      // Calculate push direction
      const dx = newX - this.player.getGridX();
      const dy = newY - this.player.getGridY();

      // Try to push the block
      if (this.tryPushBlock(blockAtTarget, dx, dy)) {
        // Block was pushed successfully, move player
        this.player.moveTo(newX, newY);
        return true;
      } else {
        // Block couldn't be pushed, don't move player
        return false;
      }
    }

    // No block in the way, just move player
    this.player.moveTo(newX, newY);
    return true;
  }

  private tryPushBlock(block: Block, dx: number, dy: number): boolean {
    // Don't push if block is already moving
    if (block.isCurrentlyMoving()) {
      return false;
    }

    const newBlockX = block.getGridX() + dx;
    const newBlockY = block.getGridY() + dy;

    // If the block would go out of bounds player can't push it
    if (
      newBlockX < 0 ||
      newBlockX >= this.grid.getWidth() ||
      newBlockY < 0 ||
      newBlockY >= this.grid.getHeight()
    ) {
      return false;
    }

    // Check if another block is blocking the push
    const blockingBlock = this.blocks.find(
      b => b !== block && b.getGridX() === newBlockX && b.getGridY() === newBlockY
    );

    if (blockingBlock) {
      return false; // Another block is in the way
    }

    // Move the block (it will do its own bounds checking)
    block.moveTo(newBlockX, newBlockY);
    return true;
  }

  getPlayer(): Player {
    return this.player;
  }

  private checkWinCondition(): void {
    // Check if all goals have blocks on them
    let allGoalsCompleted = true;

    for (const goal of this.goals) {
      const blockOnGoal = this.blocks.find(
        block => block.getGridX() === goal.getGridX() && block.getGridY() === goal.getGridY()
      );

      if (blockOnGoal) {
        goal.setCompleted(true);
      } else {
        goal.setCompleted(false);
        allGoalsCompleted = false;
      }
    }

    if (allGoalsCompleted && !this.isGameWon) {
      this.isGameWon = true;
      console.log('🎉 You won!');
    }
  }

  private checkGameOverCondition(): void {
    const playerInHole = this.holes?.find(
      hole =>
        hole.getGridX() === this.player.getGridX() && hole.getGridY() === this.player.getGridY()
    );

    if (playerInHole && !this.isGameOver) {
      this.isGameOver = true;
      console.log('Game over! You ran into a hole!');
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

    // Recreate blocks
    this.blocks = levelData.blocks.map(
      b => new Block(b.x, b.y, this.tileSize, levelData.gridWidth, levelData.gridHeight)
    );

    // Recreate holes
    this.holes = levelData.holes?.map(h => new Hole(h.x, h.y, this.tileSize)) || [];

    // Recreate goals
    this.goals = levelData.goals.map(g => new Goal(g.x, g.y, this.tileSize));

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
