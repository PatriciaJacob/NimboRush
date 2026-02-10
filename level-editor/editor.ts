// Level Editor for NimboRush
// Exports levels in the same format as levels.ts

interface LevelData {
  id: number;
  name: string;
  gridWidth: number;
  gridHeight: number;
  playerStart: { x: number; y: number };
  s3Buckets?: { x: number; y: number; capacity?: number }[];
  stepFunctions?: { x: number; y: number }[];
  holes?: { x: number; y: number }[];
  goals: { x: number; y: number; type?: 's3bucket' | 'player' }[];
  levelText?: string;
  walls?: { x: number; y: number }[];
  files?: { x: number; y: number }[];
}

type ToolType =
  | 'player'
  | 'wall'
  | 'file'
  | 's3bucket'
  | 'hole'
  | 'goal-s3'
  | 'goal-player'
  | 'stepfunction'
  | 'eraser';

interface Tile {
  type: ToolType;
  capacity?: number; // For S3 buckets
}

class LevelEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize = 48;
  private gridWidth = 10;
  private gridHeight = 8;
  private currentTool: ToolType = 'player';
  private grid: Map<string, Tile> = new Map();
  private playerPos: { x: number; y: number } | null = null;
  private isDrawing = false;
  private floorImage: HTMLImageElement | null = null;
  private wallImage: HTMLImageElement | null = null;
  private floorImageLoaded = false;
  private wallImageLoaded = false;

  // Colors for rendering
  private colors: Record<ToolType, string> = {
    player: '#7c5cff',
    wall: '#8b7355',
    file: '#ffffff',
    s3bucket: '#569a31',
    hole: '#000000',
    'goal-s3': '#52e085',
    'goal-player': '#ff9500',
    stepfunction: '#ff4f8b',
    eraser: 'transparent',
  };

  constructor() {
    this.canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.loadAssets();
    this.setupCanvas();
    this.setupEventListeners();
    this.render();
  }

  private loadAssets(): void {
    // Load floor image
    this.floorImage = new Image();
    this.floorImage.onload = () => {
      this.floorImageLoaded = true;
      this.render();
    };
    this.floorImage.onerror = () => {
      console.warn('Failed to load floor image');
      this.floorImageLoaded = false;
    };
    this.floorImage.src = '../src/assets/images/floor.png';

    // Load wall image
    this.wallImage = new Image();
    this.wallImage.onload = () => {
      this.wallImageLoaded = true;
      this.render();
    };
    this.wallImage.onerror = () => {
      console.warn('Failed to load wall image');
      this.wallImageLoaded = false;
    };
    this.wallImage.src = '../src/assets/images/Walls/shelves.png';
  }

  private setupCanvas(): void {
    this.canvas.width = this.gridWidth * this.tileSize;
    this.canvas.height = this.gridHeight * this.tileSize;
    // Re-obtain context after resize (canvas resize clears context state)
    this.ctx = this.canvas.getContext('2d')!;
  }

  private setupEventListeners(): void {
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tool = target.dataset.tool as ToolType;
        this.selectTool(tool);
      });
    });

    // Canvas interactions
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(e);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Grid resize
    document.getElementById('resize-grid')?.addEventListener('click', () => this.resizeGrid());

    // Clear level
    document.getElementById('clear-level')?.addEventListener('click', () => this.clearLevel());

    // Export JSON
    document.getElementById('export-json')?.addEventListener('click', () => this.exportJSON());

    // Modal controls
    document.getElementById('close-modal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('copy-json')?.addEventListener('click', () => this.copyToClipboard());
    document.getElementById('export-modal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'export-modal') {
        this.closeModal();
      }
    });
  }

  private selectTool(tool: ToolType): void {
    this.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tool === tool);
    });
  }

  private getGridPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.tileSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.tileSize);
    return { x: Math.max(0, Math.min(x, this.gridWidth - 1)), y: Math.max(0, Math.min(y, this.gridHeight - 1)) };
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      // Left click
      this.isDrawing = true;
      this.placeTile(e);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDrawing) {
      this.placeTile(e);
    }
  }

  private handleMouseUp(): void {
    this.isDrawing = false;
  }

  private handleRightClick(e: MouseEvent): void {
    const pos = this.getGridPos(e);
    this.eraseTile(pos.x, pos.y);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore if typing in an input
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    const keyMap: Record<string, ToolType> = {
      p: 'player',
      w: 'wall',
      f: 'file',
      s: 's3bucket',
      h: 'hole',
      g: 'goal-s3',
      o: 'goal-player',
      t: 'stepfunction',
      e: 'eraser',
    };

    const tool = keyMap[e.key.toLowerCase()];
    if (tool) {
      this.selectTool(tool);
    }
  }

  private placeTile(e: MouseEvent): void {
    const pos = this.getGridPos(e);
    const key = `${pos.x},${pos.y}`;

    if (this.currentTool === 'eraser') {
      this.eraseTile(pos.x, pos.y);
      return;
    }

    if (this.currentTool === 'player') {
      // Only one player allowed
      this.playerPos = pos;
    } else {
      // Remove player if placing something where player is
      if (this.playerPos && this.playerPos.x === pos.x && this.playerPos.y === pos.y) {
        this.playerPos = null;
      }

      const tile: Tile = { type: this.currentTool };

      // Add capacity for S3 buckets
      if (this.currentTool === 's3bucket') {
        const capacity = parseInt((document.getElementById('s3-capacity') as HTMLInputElement).value) || 0;
        if (capacity > 0) {
          tile.capacity = capacity;
        }
      }

      this.grid.set(key, tile);
    }

    this.render();
  }

  private eraseTile(x: number, y: number): void {
    const key = `${x},${y}`;

    // Check if erasing player
    if (this.playerPos && this.playerPos.x === x && this.playerPos.y === y) {
      this.playerPos = null;
    }

    this.grid.delete(key);
    this.render();
  }

  private resizeGrid(): void {
    const widthInput = document.getElementById('grid-width') as HTMLInputElement;
    const heightInput = document.getElementById('grid-height') as HTMLInputElement;

    const newWidth = Math.max(1, Math.min(30, parseInt(widthInput.value) || 10));
    const newHeight = Math.max(1, Math.min(30, parseInt(heightInput.value) || 8));

    this.gridWidth = newWidth;
    this.gridHeight = newHeight;

    // Remove tiles outside new bounds
    const keysToRemove: string[] = [];
    this.grid.forEach((_, key) => {
      const [x, y] = key.split(',').map(Number);
      if (x >= newWidth || y >= newHeight) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => this.grid.delete(key));

    // Reset player if outside bounds
    if (this.playerPos && (this.playerPos.x >= newWidth || this.playerPos.y >= newHeight)) {
      this.playerPos = null;
    }

    this.setupCanvas();
    this.render();
  }

  private clearLevel(): void {
    if (confirm('Are you sure you want to clear the entire level?')) {
      this.grid.clear();
      this.playerPos = null;
      this.render();
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw floor tiles
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // Draw floor or checkerboard pattern
        if (this.floorImage && this.floorImageLoaded) {
          this.ctx.drawImage(this.floorImage, px, py, this.tileSize, this.tileSize);
        } else {
          this.ctx.fillStyle = (x + y) % 2 === 0 ? '#3a3a5c' : '#2e2e4a';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
        }

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
      }
    }

    // Draw placed tiles
    this.grid.forEach((tile, key) => {
      const [x, y] = key.split(',').map(Number);
      this.drawTile(x, y, tile);
    });

    // Draw player
    if (this.playerPos) {
      this.drawPlayer(this.playerPos.x, this.playerPos.y);
    }
  }

  private drawTile(x: number, y: number, tile: Tile): void {
    const px = x * this.tileSize;
    const py = y * this.tileSize;
    const padding = 4;
    const size = this.tileSize - padding * 2;

    this.ctx.save();

    switch (tile.type) {
      case 'wall':
        if (this.wallImage && this.wallImageLoaded) {
          this.ctx.drawImage(this.wallImage, px, py, this.tileSize, this.tileSize);
        } else {
          this.ctx.fillStyle = this.colors.wall;
          this.ctx.fillRect(px + padding, py + padding, size, size);
        }
        break;

      case 'file':
        // Draw paper file
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(px + padding + 8, py + padding + 4, size - 16, size - 8);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(px + padding + 8, py + padding + 4, size - 16, size - 8);
        // Draw lines on paper
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
          const lineY = py + padding + 4 + i * 8;
          this.ctx.beginPath();
          this.ctx.moveTo(px + padding + 12, lineY);
          this.ctx.lineTo(px + this.tileSize - padding - 12, lineY);
          this.ctx.stroke();
        }
        break;

      case 's3bucket':
        // Draw S3 bucket
        this.ctx.fillStyle = this.colors.s3bucket;
        this.ctx.beginPath();
        this.roundRect(px + padding, py + padding, size, size, 6);
        this.ctx.fill();
        // Draw S3 text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('S3', px + this.tileSize / 2, py + this.tileSize / 2 - 6);
        // Draw capacity if set
        if (tile.capacity && tile.capacity > 0) {
          this.ctx.font = '10px sans-serif';
          this.ctx.fillText(`cap:${tile.capacity}`, px + this.tileSize / 2, py + this.tileSize / 2 + 8);
        }
        break;

      case 'hole':
        this.ctx.fillStyle = this.colors.hole;
        this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
        // Draw danger pattern
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        break;

      case 'goal-s3':
        // Draw green goal (for S3 buckets)
        this.ctx.fillStyle = this.colors['goal-s3'];
        this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        // Draw center circle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, this.tileSize / 4, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'goal-player':
        // Draw orange goal (for player)
        this.ctx.fillStyle = this.colors['goal-player'];
        this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        // Draw center circle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, this.tileSize / 4, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'stepfunction':
        // Draw step function
        this.ctx.fillStyle = this.colors.stepfunction;
        this.ctx.beginPath();
        this.roundRect(px + padding, py + padding, size, size, 6);
        this.ctx.fill();
        // Draw SF text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('STEP', px + this.tileSize / 2, py + this.tileSize / 2 - 4);
        this.ctx.fillText('FN', px + this.tileSize / 2, py + this.tileSize / 2 + 6);
        break;
    }

    this.ctx.restore();
  }

  private drawPlayer(x: number, y: number): void {
    const px = x * this.tileSize;
    const py = y * this.tileSize;
    const centerX = px + this.tileSize / 2;
    const centerY = py + this.tileSize / 2;
    const radius = this.tileSize / 2 - 6;

    // Draw player circle
    this.ctx.fillStyle = this.colors.player;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw outline
    this.ctx.strokeStyle = '#5a3cdd';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw P label
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('P', centerX, centerY);
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    // Note: caller should call beginPath() before this method
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  private exportJSON(): void {
    // Validation
    if (!this.playerPos) {
      alert('Please place a player start position!');
      return;
    }

    const goals: { x: number; y: number; type?: 's3bucket' | 'player' }[] = [];
    let hasGoals = false;

    this.grid.forEach((tile, key) => {
      if (tile.type === 'goal-s3' || tile.type === 'goal-player') {
        hasGoals = true;
      }
    });

    if (!hasGoals) {
      alert('Please place at least one goal!');
      return;
    }

    // Build level data
    const levelId = parseInt((document.getElementById('level-id') as HTMLInputElement).value) || 1;
    const levelName = (document.getElementById('level-name') as HTMLInputElement).value || 'My Level';
    const levelText = (document.getElementById('level-text') as HTMLTextAreaElement).value;

    const levelData: LevelData = {
      id: levelId,
      name: levelName,
      gridWidth: this.gridWidth,
      gridHeight: this.gridHeight,
      playerStart: { x: this.playerPos.x, y: this.playerPos.y },
      goals: [],
    };

    if (levelText.trim()) {
      levelData.levelText = levelText.trim();
    }

    // Collect entities by type
    const walls: { x: number; y: number }[] = [];
    const files: { x: number; y: number }[] = [];
    const s3Buckets: { x: number; y: number; capacity?: number }[] = [];
    const holes: { x: number; y: number }[] = [];
    const stepFunctions: { x: number; y: number }[] = [];

    this.grid.forEach((tile, key) => {
      const [x, y] = key.split(',').map(Number);

      switch (tile.type) {
        case 'wall':
          walls.push({ x, y });
          break;
        case 'file':
          files.push({ x, y });
          break;
        case 's3bucket':
          const bucket: { x: number; y: number; capacity?: number } = { x, y };
          if (tile.capacity && tile.capacity > 0) {
            bucket.capacity = tile.capacity;
          }
          s3Buckets.push(bucket);
          break;
        case 'hole':
          holes.push({ x, y });
          break;
        case 'goal-s3':
          levelData.goals.push({ x, y });
          break;
        case 'goal-player':
          levelData.goals.push({ x, y, type: 'player' });
          break;
        case 'stepfunction':
          stepFunctions.push({ x, y });
          break;
      }
    });

    // Add arrays only if they have items
    if (walls.length > 0) levelData.walls = walls;
    if (files.length > 0) levelData.files = files;
    if (s3Buckets.length > 0) levelData.s3Buckets = s3Buckets;
    if (holes.length > 0) levelData.holes = holes;
    if (stepFunctions.length > 0) levelData.stepFunctions = stepFunctions;

    // Generate JSON string
    const jsonString = JSON.stringify(levelData, null, 2);

    // Show modal
    const modal = document.getElementById('export-modal');
    const output = document.getElementById('json-output');
    if (modal && output) {
      output.textContent = jsonString;
      modal.classList.remove('hidden');
    }
  }

  private closeModal(): void {
    const modal = document.getElementById('export-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  private async copyToClipboard(): Promise<void> {
    const output = document.getElementById('json-output');
    if (output) {
      try {
        await navigator.clipboard.writeText(output.textContent || '');
        const btn = document.getElementById('copy-json');
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please select and copy manually.');
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LevelEditor();
});
