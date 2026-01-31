import { Grid } from './grid';
import { Player } from './player';
import { Block } from './block';
import { Goal } from './goal';
import { InputHandler } from './input';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private player: Player;
  private blocks: Block[];
  private goals: Goal[];
  private inputHandler: InputHandler;
  private lastFrameTime: number = 0;
  private isGameWon: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Game configuration
    const tileSize = 48;
    const gridWidth = 12;
    const gridHeight = 10;

    // Set canvas size
    this.canvas.width = gridWidth * tileSize;
    this.canvas.height = gridHeight * tileSize;

    // Initialize game objects
    this.grid = new Grid(gridWidth, gridHeight, tileSize);
    this.player = new Player(1, 1, tileSize, gridWidth, gridHeight); // Start at grid position (1, 1)

    // Create some blocks for testing
    this.blocks = [
      new Block(3, 2, tileSize, gridWidth, gridHeight),
      new Block(5, 4, tileSize, gridWidth, gridHeight),
      new Block(7, 5, tileSize, gridWidth, gridHeight),
      new Block(4, 7, tileSize, gridWidth, gridHeight),
    ];

    // Create goal squares
    this.goals = [
      new Goal(9, 3, tileSize),
    ];

    this.inputHandler = new InputHandler(this);
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
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render grid
    this.grid.render(this.ctx);

    // Render goals (behind blocks)
    this.goals.forEach(goal => goal.render(this.ctx));

    // Render blocks
    this.blocks.forEach(block => block.render(this.ctx));

    // Render player
    this.player.render(this.ctx);

    // Render win message
    if (this.isGameWon) {
      this.renderWinMessage();
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
    if (newBlockX < 0 || newBlockX >= this.grid.getWidth() || newBlockY < 0 || newBlockY >= this.grid.getHeight()) {
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
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
  }
}
