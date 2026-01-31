import { Grid } from './grid';
import { Player } from './player';
import { InputHandler } from './input';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private player: Player;
  private inputHandler: InputHandler;
  private lastFrameTime: number = 0;

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
    this.inputHandler = new InputHandler(this.player);
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
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render grid
    this.grid.render(this.ctx);

    // Render player
    this.player.render(this.ctx);
  }
}
