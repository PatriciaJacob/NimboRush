export class StartScreen {
  private overlay: HTMLElement;
  private menuItems: NodeListOf<HTMLElement>;
  private controlsPanel: HTMLElement;
  private selectedIndex: number = 0;
  private onStart: () => void;
  private showingControls: boolean = false;
  private keyHandler: (e: KeyboardEvent) => void;

  constructor(onStart: () => void) {
    this.onStart = onStart;
    this.overlay = document.getElementById('start-overlay')!;
    this.menuItems = document.querySelectorAll('.arcade-menu-item');
    this.controlsPanel = document.getElementById('controls-panel')!;

    this.keyHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    document.addEventListener('keydown', this.keyHandler);

    // Also support mouse clicks on menu items
    this.menuItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.updateSelection();
        this.executeSelection();
      });

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.overlay.classList.contains('hidden')) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.moveSelection(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveSelection(1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.executeSelection();
        break;
      case 'Escape':
        if (this.showingControls) {
          this.toggleControls(false);
        }
        break;
    }
  }

  private moveSelection(direction: number): void {
    this.selectedIndex =
      (this.selectedIndex + direction + this.menuItems.length) %
      this.menuItems.length;
    this.updateSelection();
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  private executeSelection(): void {
    const selectedItem = this.menuItems[this.selectedIndex];
    const action = selectedItem.dataset.action;

    switch (action) {
      case 'start':
        this.handleStart();
        break;
      case 'controls':
        this.toggleControls(!this.showingControls);
        break;
    }
  }

  private toggleControls(show: boolean): void {
    this.showingControls = show;
    if (show) {
      this.controlsPanel.classList.remove('hidden');
      this.controlsPanel.classList.add('show');
    } else {
      this.controlsPanel.classList.add('hidden');
      this.controlsPanel.classList.remove('show');
    }
  }

  private handleStart(): void {
    this.hide();
    document.removeEventListener('keydown', this.keyHandler);
    this.onStart();
  }

  private hide(): void {
    this.overlay.classList.add('hidden');
  }
}
