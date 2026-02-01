export class PaperFile {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private fileIcon: HTMLImageElement;
  private iconLoaded: boolean = false;
  private isConsumed: boolean = false;
  private pickUpSound: HTMLAudioElement;

  constructor(gridX: number, gridY: number, tileSize: number) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;

    this.fileIcon = new Image();
    this.fileIcon.onload = () => {
      this.iconLoaded = true;
    };
    this.fileIcon.src = 'src/icons/paper.png';
    this.pickUpSound = new Audio('src/sounds/paper-rustle-81855.mp3');
    this.pickUpSound.playbackRate = 5;
  }

  consume(): void {
    this.isConsumed = true;
    this.pickUpSound.currentTime = 0;
    this.pickUpSound.play();
  }

  isConsumable(): boolean {
    return !this.isConsumed;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Don't render if consumed
    if (this.isConsumed) {
      return;
    }

    const pixelX = this.gridX * this.tileSize;
    const pixelY = this.gridY * this.tileSize;
    const padding = 4;
    const bodySize = this.tileSize - padding * 2;

    // Draw white background
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(pixelX + padding, pixelY + padding, bodySize, bodySize);

    // Draw file icon if loaded
    if (this.iconLoaded) {
      ctx.drawImage(this.fileIcon, pixelX + padding, pixelY + padding, bodySize, bodySize);
    }
  }

  getGridX(): number {
    return this.gridX;
  }

  getGridY(): number {
    return this.gridY;
  }
}
