export class stepFunctions {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private stepFunctionsIcon: HTMLImageElement;
  private iconLoaded: boolean = false;
  private isConsumed: boolean = false;

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;

    this.stepFunctionsIcon = new Image();
    this.stepFunctionsIcon.onload = () => {
      this.iconLoaded = true;
    };
    this.stepFunctionsIcon.src = 'src/icons/stepFunctions.svg';
  }

  // update(deltaTime: number): void {
  //   if (this.isConsumed) {
  //    // stop rendering

  //   }
  // }

  render(ctx: CanvasRenderingContext2D): void {
    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const padding = 4;
    const bodySize = this.tileSize - padding * 2;

    // Create clipping path for rounded rectangle
    ctx.save();
    this.roundRect(ctx, pixelX + padding, pixelY + padding, bodySize, bodySize, 8);
    ctx.clip();

    // Draw S3 icon if loaded (clipped to rounded rect)
    if (this.iconLoaded) {
      ctx.drawImage(this.stepFunctionsIcon, pixelX + padding, pixelY + padding, bodySize, bodySize);
    }

    ctx.restore();
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
