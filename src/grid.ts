export class Grid {
  private width: number;
  private height: number;
  private tileSize: number;
  private floorImage: HTMLImageElement;
  private imageLoaded: boolean = false;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;

    // Load floor image
    this.floorImage = new Image();
    this.floorImage.onload = () => {
      this.imageLoaded = true;
    };
    this.floorImage.src = 'src/assets/images/floor.png';
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw floor tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;

        if (this.imageLoaded) {
          ctx.drawImage(this.floorImage, pixelX, pixelY, this.tileSize, this.tileSize);
        } else {
          // Fallback color while image loads
          ctx.fillStyle = '#3e3e42';
          ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);
        }
      }
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
