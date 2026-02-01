// Obstacles
export const obstacles = [
  { x: 10, y: 12, width: 13, height: 8 }, // Center (x, y), width, height
  { x: -9, y: 12, width: 13, height: 8 },
];

// Collision check
export function checkCollision(px: number, py: number): boolean {
  for (const obs of obstacles) {
    const left = obs.x - obs.width / 2;
    const right = obs.x + obs.width / 2;
    const top = obs.y + obs.height / 2;
    const bottom = obs.y - obs.height / 2;

    if (px >= left && px <= right && py >= bottom && py <= top) {
      return true; // Collision detected
    }
  }
  return false;
}
