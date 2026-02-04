import { Entity, EntityType } from './entity';

export type GoalType = 's3bucket' | 'player';

export class Goal implements Entity {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private isCompleted: boolean = false;
  private type: GoalType;

  constructor(gridX: number, gridY: number, tileSize: number, type: GoalType = 's3bucket') {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.type = type;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const padding = 8;
    const size = this.tileSize - padding * 2;

    // Choose colors based on goal type
    let fillColor: string;
    let strokeColor: string;
    let completedFillColor: string;
    let completedStrokeColor: string;

    if (this.type === 'player') {
      // Orange for player goals
      fillColor = '#ff9500';
      strokeColor = '#ff7700';
      completedFillColor = '#ff7700';
      completedStrokeColor = '#ff5500';
    } else {
      // Green for S3 bucket goals
      fillColor = '#52e085';
      strokeColor = '#2ecc71';
      completedFillColor = '#2ecc71';
      completedStrokeColor = '#27ae60';
    }

    // Draw goal square
    if (this.isCompleted) {
      ctx.fillStyle = completedFillColor;
      ctx.strokeStyle = completedStrokeColor;
    } else {
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
    }

    ctx.fillRect(pixelX + padding, pixelY + padding, size, size);
    ctx.lineWidth = 2;
    ctx.strokeRect(pixelX + padding, pixelY + padding, size, size);

    // Draw target symbol (circle)
    ctx.strokeStyle = this.isCompleted ? completedStrokeColor : strokeColor;
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

  getType(): GoalType {
    return this.type;
  }

  // Entity interface implementation
  getEntityType(): EntityType {
    return EntityType.GOAL;
  }

  blocksMovement(): boolean {
    return false; // Goals don't block movement
  }
}
