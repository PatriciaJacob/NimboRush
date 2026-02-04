import { Entity, EntityType } from './entity';

export class Player implements Entity {
  private gridX: number;
  private gridY: number;
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private isMoving: boolean = false;
  private moveProgress: number = 0;
  private moveSpeed: number = 3; // tiles per second
  private targetGridX: number;
  private targetGridY: number;
  private previousGridX: number;
  private previousGridY: number;
  private isFalling: boolean = false;
  private fallProgress: number = 0;
  private fallSpeed: number = 1.5; // duration in seconds for fall animation
  private fallingSound: HTMLAudioElement;
  private invalidMoveSound: HTMLAudioElement;
  private filesCollected: number = 0;
  private sprite: HTMLImageElement;
  private spriteLoaded: boolean = false;
  private walkFrames: HTMLImageElement[] = [];
  private walkFramesLoaded: number = 0;
  private readonly totalWalkFrames: number = 10;
  private walkAnimationTime: number = 0;
  private readonly walkFrameDuration: number = 33; // milliseconds per frame (~10 frames in 333ms movement)

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

    // Load falling sound
    this.fallingSound = new Audio('src/sounds/falling-bomb-41038.mp3');
    this.fallingSound.playbackRate = 2;
    this.invalidMoveSound = new Audio('src/sounds/wood-step-sample-1-47664.mp3');

    // Load player sprite
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
    this.sprite.src = 'src/assets/Nimbo/Nimbof.png';

    // Load walk animation frames
    for (let i = 1; i <= this.totalWalkFrames; i++) {
      const frame = new Image();
      frame.onload = () => {
        this.walkFramesLoaded++;
      };
      frame.src = `src/assets/Nimbo/NimboWalk/Nimbo - - ${i}.png`;
      this.walkFrames.push(frame);
    }
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

      // Update walk animation time while moving
      this.walkAnimationTime += deltaTime;

      if (this.moveProgress >= 1) {
        // Movement complete
        this.gridX = this.targetGridX;
        this.gridY = this.targetGridY;
        this.isMoving = false;
        this.moveProgress = 0;
        this.walkAnimationTime = 0;
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
    const padding = 0;

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

    // Draw Nimbo sprite
    const spriteSize = this.tileSize - padding * 2;

    if (this.isMoving && this.walkFramesLoaded === this.totalWalkFrames) {
      // Use walk animation when moving
      const frameIndex =
        Math.floor(this.walkAnimationTime / this.walkFrameDuration) % this.totalWalkFrames;
      ctx.drawImage(
        this.walkFrames[frameIndex],
        pixelX + padding,
        pixelY + padding,
        spriteSize,
        spriteSize
      );
    } else if (this.spriteLoaded) {
      // Use standing sprite when not moving
      ctx.drawImage(this.sprite, pixelX + padding, pixelY + padding, spriteSize, spriteSize);
    } else {
      // Fallback: draw purple square while sprites are loading
      ctx.fillStyle = '#665CD2';
      ctx.fillRect(pixelX + padding, pixelY + padding, spriteSize, spriteSize);
    }

    // Restore context state
    ctx.restore();
  }

  moveTo(gridX: number, gridY: number): void {
    // Do not move if already moving
    if (this.isMoving) {
      return;
    }

    // Check if target position is within grid bounds if not, do not move
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      this.invalidMoveSound.currentTime = 0; // Reset to start in case it was already playing
      this.invalidMoveSound.play();
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

  collectFile(): void {
    this.filesCollected++;
  }

  depositFile(): boolean {
    if (this.filesCollected > 0) {
      this.filesCollected--;
      return true;
    }
    return false;
  }

  getFilesCollected(): number {
    return this.filesCollected;
  }

  hasFiles(): boolean {
    return this.filesCollected > 0;
  }

  // Entity interface implementation
  getEntityType(): EntityType {
    return EntityType.PLAYER;
  }

  blocksMovement(): boolean {
    return false; // Player doesn't block other entities
  }
}
