import { Game } from './game';
import { StartScreen } from './startScreen';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

new StartScreen(() => {
  const game = new Game(canvas);
  game.start();
});
