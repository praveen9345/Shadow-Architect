export type ShapeType = "square" | "triangle" | "circle" | "rectangle";

export interface GameObject {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export function isPointInShape(
  px: number,
  py: number,
  obj: GameObject,
): boolean {
  const dx = px - obj.x;
  const dy = py - obj.y;
  const cos = Math.cos(-obj.rotation);
  const sin = Math.sin(-obj.rotation);
  const lx = (dx * cos - dy * sin) / obj.scale;
  const ly = (dx * sin + dy * cos) / obj.scale;

  if (obj.type === "square") {
    return lx >= -50 && lx <= 50 && ly >= -50 && ly <= 50;
  } else if (obj.type === "rectangle") {
    return lx >= -40 && lx <= 40 && ly >= -80 && ly <= 80;
  } else if (obj.type === "circle") {
    return lx * lx + ly * ly <= 2500;
  } else if (obj.type === "triangle") {
    const x1 = 0,
      y1 = -50;
    const x2 = 50,
      y2 = 50;
    const x3 = -50,
      y3 = 50;
    const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    const a = ((y2 - y3) * (lx - x3) + (x3 - x2) * (ly - y3)) / denominator;
    const b = ((y3 - y1) * (lx - x3) + (x1 - x3) * (ly - y3)) / denominator;
    const c = 1 - a - b;
    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
  }
  return false;
}
