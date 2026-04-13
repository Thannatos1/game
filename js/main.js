import { createServices } from './services.js';
import { createGame } from './game.js';

const canvas = document.getElementById('c');
const services = createServices();
const game = createGame(canvas, services);

game.mount();

function posFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

document.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  game.handleTap(t.clientX - rect.left, t.clientY - rect.top);
}, { passive: false });

document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
  const { x, y } = posFromEvent(e);
  game.handleTap(x, y);
});
window.addEventListener('resize', () => game.resize());
