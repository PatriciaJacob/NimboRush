export class AudioManager {
  private levelCompleteSound: HTMLAudioElement;
  private invalidMoveSound: HTMLAudioElement;
  private playerMoveSound: HTMLAudioElement;
  private backgroundMusic: HTMLAudioElement;
  private isMuted: boolean = false;

  constructor() {
    this.levelCompleteSound = new Audio('src/assets/sounds/correct_answer_toy_bi-bling-476370.mp3');
    this.invalidMoveSound = new Audio('src/assets/sounds/wood-step-sample-1-47664.mp3');
    this.playerMoveSound = new Audio('src/assets/sounds/snow-step-1-81064.mp3');
    this.playerMoveSound.playbackRate = 2;

    this.backgroundMusic = new Audio('src/assets/sounds/Cardboard Crates & Coffee Breaks.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;
  }

  startBackgroundMusic(): void {
    this.backgroundMusic.play().catch(() => {
      // Auto-play was prevented, will start on first user interaction
      const startMusic = () => {
        this.backgroundMusic.play();
        document.removeEventListener('keydown', startMusic);
        document.removeEventListener('click', startMusic);
      };
      document.addEventListener('keydown', startMusic);
      document.addEventListener('click', startMusic);
    });
  }

  playLevelComplete(): void {
    this.levelCompleteSound.currentTime = 0;
    this.levelCompleteSound.play();
  }

  playInvalidMove(): void {
    this.invalidMoveSound.currentTime = 0;
    this.invalidMoveSound.play();
  }

  playPlayerMove(): void {
    this.playerMoveSound.currentTime = 0;
    this.playerMoveSound.play();
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    this.levelCompleteSound.muted = this.isMuted;
    this.invalidMoveSound.muted = this.isMuted;
    this.playerMoveSound.muted = this.isMuted;
    this.backgroundMusic.muted = this.isMuted;

    return this.isMuted;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}
