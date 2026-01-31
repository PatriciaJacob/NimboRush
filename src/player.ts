export class Player {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private isMoving: boolean = false;
  private moveProgress: number = 0;
  private moveSpeed: number = 8; // tiles per second
  private targetGridX: number;
  private targetGridY: number;
  private previousGridX: number;
  private previousGridY: number;

  constructor(
    gridX: number,
    gridY: number,
    tileSize: number,
    gridWidth: number,
    gridHeight: number
  ) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.targetGridX = gridX;
    this.targetGridY = gridY;
    this.previousGridX = gridX;
    this.previousGridY = gridY;
  }

  update(deltaTime: number): void {
    if (this.isMoving) {
      // Convert deltaTime from milliseconds to seconds and update progress
      this.moveProgress += (this.moveSpeed * deltaTime) / 1000;

      if (this.moveProgress >= 1) {
        // Movement complete
        this.gridX = this.targetGridX;
        this.gridY = this.targetGridY;
        this.isMoving = false;
        this.moveProgress = 0;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    let renderX: number;
    let renderY: number;

    if (this.isMoving) {
      // Interpolate between previous and target position
      renderX = this.previousGridX + (this.targetGridX - this.previousGridX) * this.moveProgress;
      renderY = this.previousGridY + (this.targetGridY - this.previousGridY) * this.moveProgress;
    } else {
      renderX = this.gridX;
      renderY = this.gridY;
    }

    const pixelX = renderX * this.tileSize;
    const pixelY = renderY * this.tileSize;
    const padding = 4;

    // Draw Nimbo as a simple cloud-like shape
    ctx.fillStyle = '#3498db'; // Nice blue color for our cloud character

    // Main body (rounded rectangle)
    const bodySize = this.tileSize - padding * 2;
    this.roundRect(ctx, pixelX + padding, pixelY + padding, bodySize, bodySize, 8);
    ctx.fill();

    // Add some character details (simple face)
    ctx.fillStyle = '#ecf0f1';
    const eyeSize = 6;
    const eyeY = pixelY + this.tileSize / 2 - 4;

    // Left eye
    ctx.beginPath();
    ctx.arc(pixelX + this.tileSize / 2 - 8, eyeY, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(pixelX + this.tileSize / 2 + 8, eyeY, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  moveTo(gridX: number, gridY: number): void {
    // Do not move if already moving
    if (this.isMoving) {
      return;
    }

    // Check if target position is within grid bounds if not, do not move
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return;
    }

    this.previousGridX = this.gridX;
    this.previousGridY = this.gridY;
    this.targetGridX = gridX;
    this.targetGridY = gridY;
    this.isMoving = true;
    this.moveProgress = 0;
  }

  getGridX(): number {
    return this.gridX;
  }

  getGridY(): number {
    return this.gridY;
  }

  isCurrentlyMoving(): boolean {
    return this.isMoving;
  }
}
