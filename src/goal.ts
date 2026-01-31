export class Goal {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private isCompleted: boolean = false;

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const padding = 8;
    const size = this.tileSize - padding * 2;

    // Draw goal square
    if (this.isCompleted) {
      // Bright green when completed
      ctx.fillStyle = '#2ecc71';
      ctx.strokeStyle = '#27ae60';
    } else {
      // Lighter green when not completed
      ctx.fillStyle = '#52e085';
      ctx.strokeStyle = '#2ecc71';
    }

    ctx.fillRect(pixelX + padding, pixelY + padding, size, size);
    ctx.lineWidth = 2;
    ctx.strokeRect(pixelX + padding, pixelY + padding, size, size);

      // Draw target symbol (circle)
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 2;

      const centerX = pixelX + this.tileSize / 2;
      const centerY = pixelY + this.tileSize / 2;
      const radius = size / 4;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    
  }

  getGridX(): number {
    return this.gridX;
  }

  getGridY(): number {
    return this.gridY;
  }

  setCompleted(completed: boolean): void {
    this.isCompleted = completed;
  }

  isComplete(): boolean {
    return this.isCompleted;
  }
}
