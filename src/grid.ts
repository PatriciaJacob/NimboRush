export class Grid {
  private width: number;
  private height: number;
  private tileSize: number;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw checkerboard pattern for better visibility
    // Light tile color - soft warm gray
    ctx.fillStyle = '#3e3e42';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // Draw grid lines - subtle borders
    ctx.strokeStyle = '#1e1e20';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.width; x++) {
      const pixelX = x * this.tileSize;
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, this.height * this.tileSize);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.height; y++) {
      const pixelY = y * this.tileSize;
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(this.width * this.tileSize, pixelY);
      ctx.stroke();
    }
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getTileSize(): number {
    return this.tileSize;
  }
}
