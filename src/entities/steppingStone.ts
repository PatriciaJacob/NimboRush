import { Entity, EntityType } from './entity';

export class SteppingStone implements Entity {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private growthProgress: number = 0; // 0 to 1
  private isGrowing: boolean = false;
  private isVisible: boolean = false;
  private growthSpeed: number = 0.003; // How fast the stone grows (per ms)

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
  }

  activate(): void {
    this.isVisible = true;
    this.isGrowing = true;
    this.growthProgress = 0;
  }

  update(deltaTime: number): void {
    if (this.isGrowing) {
      this.growthProgress += this.growthSpeed * deltaTime;
      if (this.growthProgress >= 1) {
        this.growthProgress = 1;
        this.isGrowing = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isVisible) {
      return;
    }

    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const bodySize = this.tileSize;

    // Eased growth for smooth animation (ease-out cubic)
    const easedProgress = 1 - Math.pow(1 - this.growthProgress, 3);

    // Scale from center
    const scaledSize = bodySize * easedProgress;
    const offset = (bodySize - scaledSize) / 2;

    ctx.save();

    // Draw stone base (gray/brown color)
    ctx.fillStyle = '#6b5b4d';
    this.roundRect(
      ctx,
      pixelX + offset,
      pixelY + offset,
      scaledSize,
      scaledSize,
      4 * easedProgress
    );
    ctx.fill();

    // Add lighter inner detail for depth
    if (easedProgress > 0.5) {
      const innerPadding = 6 * easedProgress;
      const innerSize = scaledSize - innerPadding * 2;
      ctx.fillStyle = '#8b7b6d';
      this.roundRect(
        ctx,
        pixelX + offset + innerPadding,
        pixelY + offset + innerPadding,
        innerSize,
        innerSize,
        3 * easedProgress
      );
      ctx.fill();
    }

    // Add some texture/highlights
    if (easedProgress > 0.7) {
      const highlightOpacity = (easedProgress - 0.7) / 0.3;
      ctx.fillStyle = `rgba(139, 123, 109, ${0.3 * highlightOpacity})`;
      ctx.fillRect(
        pixelX + offset + scaledSize * 0.2,
        pixelY + offset + scaledSize * 0.15,
        scaledSize * 0.3,
        scaledSize * 0.1
      );
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

  isFullyGrown(): boolean {
    return this.growthProgress >= 1;
  }

  isSolid(): boolean {
    // Stone becomes solid when fully grown
    return this.isFullyGrown();
  }

  // Entity interface implementation
  getEntityType(): EntityType {
    return EntityType.STEPPING_STONE;
  }

  blocksMovement(): boolean {
    return false;
  }
}
