import { Player } from './player';

export class InputHandler {
  private player: Player;
  private keysPressed: Set<string> = new Set();

  constructor(player: Player) {
    this.player = player;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default arrow key behavior (scrolling)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }

    // Only process if not already pressed (prevents key repeat)
    if (this.keysPressed.has(event.key)) {
      return;
    }

    this.keysPressed.add(event.key);

    // Only move if player is not currently moving
    if (this.player.isCurrentlyMoving()) {
      return;
    }

    const currentX = this.player.getGridX();
    const currentY = this.player.getGridY();

    switch (event.key) {
      case 'ArrowUp':
        this.player.moveTo(currentX, currentY - 1);
        break;
      case 'ArrowDown':
        this.player.moveTo(currentX, currentY + 1);
        break;
      case 'ArrowLeft':
        this.player.moveTo(currentX - 1, currentY);
        break;
      case 'ArrowRight':
        this.player.moveTo(currentX + 1, currentY);
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key);
  }
}
