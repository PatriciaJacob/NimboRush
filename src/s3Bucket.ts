export class S3Bucket {
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
  private moveSound: HTMLAudioElement;
  private s3Icon: HTMLImageElement;
  private iconLoaded: boolean = false;
  private capacity: number;
  private filesCollected: number = 0;
  private isFalling: boolean = false;
  private fallProgress: number = 0;
  private fallSpeed: number = 1.5; // duration in seconds for fall animation
  private fallingSound: HTMLAudioElement;
  private fillSound: HTMLAudioElement;

  constructor(
    gridX: number,
    gridY: number,
    tileSize: number,
    gridWidth: number,
    gridHeight: number,
    capacity?: number
  ) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.capacity = capacity || 0;
    this.tileSize = tileSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.targetGridX = gridX;
    this.targetGridY = gridY;
    this.previousGridX = gridX;
    this.previousGridY = gridY;

    this.moveSound = new Audio('src/sounds/moving-with-table-105076.mp3');
    this.moveSound.playbackRate = 3;
    this.fallingSound = new Audio('src/sounds/falling-bomb-41038.mp3');
    this.fallingSound.playbackRate = 2;
    this.fillSound = new Audio('src/sounds/paper-rustle-81855.mp3');
    this.fillSound.playbackRate = 5;

    // Load S3 icon
    this.s3Icon = new Image();
    this.s3Icon.onload = () => {
      this.iconLoaded = true;
    };
    this.s3Icon.src = 'src/icons/s3.svg';
  }

  update(deltaTime: number): void {
    if (this.isFalling) {
      // Update falling animation
      this.fallProgress += deltaTime / (this.fallSpeed * 1000);

      // Cap at 1.0 when animation completes
      if (this.fallProgress > 1) {
        this.fallProgress = 1;
      }
    } else if (this.isMoving) {
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
    const bodySize = this.tileSize - padding * 2;

    // Calculate scale and rotation if falling
    let scale = 1;
    let rotation = 0;
    let opacity = 1;

    if (this.isFalling) {
      // Scale from 1 to 0 (shrinking)
      scale = 1 - this.fallProgress;
      // Spin 3 full rotations during fall
      rotation = this.fallProgress * Math.PI * 6;
      // Fade out slightly towards the end
      opacity = 1 - this.fallProgress * 0.3;
    }

    // Save context state before transformation
    ctx.save();

    // Apply transformations if falling
    if (this.isFalling) {
      const centerX = pixelX + this.tileSize / 2;
      const centerY = pixelY + this.tileSize / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.translate(-centerX, -centerY);
    }

    // Create clipping path for rounded rectangle
    this.roundRect(ctx, pixelX + padding, pixelY + padding, bodySize, bodySize, 8);
    ctx.clip();

    // Draw S3 icon if loaded (clipped to rounded rect)
    if (this.iconLoaded) {
      ctx.drawImage(this.s3Icon, pixelX + padding, pixelY + padding, bodySize, bodySize);
    }

    ctx.restore();

    // Apply greyscale overlay if bucket has capacity requirements
    if (this.capacity > 0 && !this.isFull()) {
      ctx.save();

      // Apply falling transformations again for the overlay
      if (this.isFalling) {
        const centerX = pixelX + this.tileSize / 2;
        const centerY = pixelY + this.tileSize / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        ctx.translate(-centerX, -centerY);
      }

      // Calculate saturation based on fill percentage (0 = fully grey, 1 = full color)
      const fillPercentage = this.filesCollected / this.capacity;

      // Grey overlay gets more transparent as we collect files
      const greyOpacity = 0.8 * (1 - fillPercentage);

      // Draw semi-transparent grey overlay
      ctx.fillStyle = `rgba(80, 80, 80, ${greyOpacity})`;
      this.roundRect(ctx, pixelX + padding, pixelY + padding, bodySize, bodySize, 8);
      ctx.fill();

      ctx.restore();
    }

    // Draw capacity number on top of the bucket if it has a capacity requirement
    if (this.capacity > 0) {
      ctx.save();

      // Apply falling transformations for the text as well
      if (this.isFalling) {
        const centerX = pixelX + this.tileSize / 2;
        const centerY = pixelY + this.tileSize / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        ctx.translate(-centerX, -centerY);
      }

      if (!this.isFull()) {
        // Set font properties
        const fontSize = Math.floor(this.tileSize * 0.35);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Display "collected/capacity"
        const capacityText = `${this.filesCollected}/${this.capacity}`;

        // Calculate text position (center top of the bucket)
        const textX = pixelX + this.tileSize / 2;
        const textY = pixelY + this.tileSize / 2;

        // Draw the capacity text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(capacityText, textX, textY);
      }

      ctx.restore();
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

  moveTo(gridX: number, gridY: number): void {
    // Do not move if already moving
    if (this.isMoving) {
      return;
    }

    // Check if target position is within grid bounds if not, do not move
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return;
    }

    this.moveSound.currentTime = 0;
    this.moveSound.play();

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

  addFile(): boolean {
    // Only add if we haven't reached capacity
    if (this.capacity > 0 && this.filesCollected < this.capacity) {
      this.fillSound.currentTime = 0;
      this.fillSound.play();
      this.filesCollected++;
      return true;
    }
    return false;
  }

  isFull(): boolean {
    // If no capacity requirement, it's always considered "full" (movable)
    if (this.capacity === 0) {
      return true;
    }

    return this.filesCollected >= this.capacity;
  }

  isMovable(): boolean {
    // Bucket is movable when it's full (has collected enough files)
    return this.isFull();
  }

  getFilesCollected(): number {
    return this.filesCollected;
  }

  getCapacity(): number {
    return this.capacity;
  }

  startFalling(): void {
    this.isFalling = true;
    this.fallProgress = 0;
    this.isMoving = false; // Stop any current movement

    // Play falling sound
    this.fallingSound.currentTime = 0; // Reset to start in case it was already playing
    this.fallingSound.play().catch(err => console.error('Error playing falling sound:', err));
  }

  isFallingIntoHole(): boolean {
    return this.isFalling;
  }
}
