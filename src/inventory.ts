export class Inventory {
  private width: number;
  private height: number = 50; // Fixed height for inventory bar
  private tileSize: number;
  private yPosition: number;

  constructor(width: number, tileSize: number, gridHeight: number) {
    this.width = width;
    this.tileSize = tileSize;
    this.yPosition = gridHeight * tileSize;
  }

  render(ctx: CanvasRenderingContext2D, filesCollected: number): void {
    // Draw inventory background
    ctx.fillStyle = '#1e1e20';
    ctx.fillRect(0, this.yPosition, this.width * this.tileSize, this.height);

    // Draw border at top
    ctx.strokeStyle = '#3e3e42';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.yPosition);
    ctx.lineTo(this.width * this.tileSize, this.yPosition);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Files:', 10, this.yPosition + this.height / 2);

    // Draw file count
    ctx.fillStyle = filesCollected > 0 ? '#4CAF50' : '#888888';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(filesCollected.toString(), 70, this.yPosition + this.height / 2);

    // Draw file icons to visualize inventory
    const iconSize = 24;
    const iconPadding = 4;
    let iconX = 100;

    for (let i = 0; i < filesCollected; i++) {
      // Draw a small file icon representation
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(iconX, this.yPosition + (this.height - iconSize) / 2, iconSize, iconSize);

      // Add a simple border
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      ctx.strokeRect(iconX, this.yPosition + (this.height - iconSize) / 2, iconSize, iconSize);

      iconX += iconSize + iconPadding;

      // Limit display to prevent overflow
      if (i >= 10) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText('...', iconX, this.yPosition + this.height / 2);
        break;
      }
    }
  }

  getHeight(): number {
    return this.height;
  }

  updatePosition(gridHeight: number): void {
    this.yPosition = gridHeight * this.tileSize;
  }
}
