export class Wall {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private wallIcon: HTMLImageElement;
  private iconLoaded: boolean = false;

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;

    // Load S3 icon
    this.wallIcon = new Image();
    this.wallIcon.onload = () => {
      this.iconLoaded = true;
    };
    this.wallIcon.src = 'src/icons/cabinet.png';
  }

  render(ctx: CanvasRenderingContext2D): void {
    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const bodySize = this.tileSize;

    this.roundRect(ctx, pixelX, pixelY, bodySize, bodySize, 0);

    // Draw S3 icon if loaded (clipped to rounded rect)
    if (this.iconLoaded) {
      ctx.drawImage(this.wallIcon, pixelX, pixelY, bodySize, bodySize);
    }
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

  getGridX(): number {
    return this.gridX;
  }

  getGridY(): number {
    return this.gridY;
  }
}
