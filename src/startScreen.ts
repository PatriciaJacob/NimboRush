export class StartScreen {
  private overlay: HTMLElement;
  private startBtn: HTMLElement;
  private onStart: () => void;

  constructor(onStart: () => void) {
    this.onStart = onStart;
    this.overlay = document.getElementById('start-overlay')!;
    this.startBtn = document.getElementById('start-btn')!;

    this.startBtn.addEventListener('click', () => this.handleStart());
  }

  private handleStart(): void {
    this.hide();
    this.onStart();
  }

  private hide(): void {
    this.overlay.classList.add('hidden');
  }
}
