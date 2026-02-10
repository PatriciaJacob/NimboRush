import { Game } from './game';

export class InputHandler {
  private game: Game;
  private keysPressed: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
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

    // Handle pause toggle (always available)
    if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
      this.game.togglePause();
      return;
    }

    // Handle mute toggle (always available, even when paused)
    if (event.key === 'm' || event.key === 'M') {
      this.game.toggleMute();
      return;
    }

    // Block other inputs while paused
    if (this.game.getIsPaused()) {
      return;
    }

    // Get player position from game
    const player = this.game.getPlayer();
    const currentX = player.getGridX();
    const currentY = player.getGridY();

    switch (event.key) {
      case 'ArrowUp':
        this.game.tryMovePlayer(currentX, currentY - 1);
        break;
      case 'ArrowDown':
        this.game.tryMovePlayer(currentX, currentY + 1);
        break;
      case 'ArrowLeft':
        this.game.tryMovePlayer(currentX - 1, currentY);
        break;
      case 'ArrowRight':
        this.game.tryMovePlayer(currentX + 1, currentY);
        break;
      case 'r':
      case 'R':
        this.game.restart();
        break;
      case 'n':
      case 'N':
        this.game.nextLevel();
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key);
  }
}
