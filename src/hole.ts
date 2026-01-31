export class Hole {
  private gridX: number;
  private gridY: number;
  private tileSize: number;

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const padding = 4;

    ctx.fillStyle = 'purple';

    // Main body (circle)
    const bodySize = this.tileSize - padding * 2;
    this.Circle(ctx, pixelX + padding, pixelY + padding, bodySize, bodySize);
    ctx.fill();
  }

  private Circle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const radius = width / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
  }

  getGridX(): number {
    return this.gridX;
  }

  getGridY(): number {
    return this.gridY;
  }
}
