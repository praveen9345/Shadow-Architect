import { ShapeType, GameObject } from "./math";

export interface LevelData {
  id: number;
  name: string;
  targetShapes: {
    type: ShapeType;
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }[];
  objects: GameObject[];
  light: { x: number; y: number; z: number; locked?: boolean };
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "First Light",
    targetShapes: [{ type: "square", x: 500, y: 300, rotation: 0, scale: 2 }],
    objects: [
      { id: "o1", type: "square", x: 200, y: 300, rotation: 0, scale: 1 },
    ],
    light: { x: 100, y: 300, z: 100, locked: true },
  },
  {
    id: 2,
    name: "The House",
    targetShapes: [
      { type: "square", x: 500, y: 350, rotation: 0, scale: 2 },
      { type: "triangle", x: 500, y: 150, rotation: 0, scale: 2 },
    ],
    objects: [
      { id: "o1", type: "square", x: 200, y: 400, rotation: 0, scale: 1 },
      { id: "o2", type: "triangle", x: 300, y: 400, rotation: 0, scale: 1 },
    ],
    light: { x: 100, y: 300, z: 100, locked: false },
  },
  {
    id: 3,
    name: "The Tree",
    targetShapes: [
      { type: "rectangle", x: 500, y: 400, rotation: 0, scale: 1.5 },
      { type: "circle", x: 500, y: 220, rotation: 0, scale: 2.5 },
    ],
    objects: [
      { id: "o1", type: "rectangle", x: 150, y: 400, rotation: 0, scale: 0.75 },
      { id: "o2", type: "circle", x: 250, y: 400, rotation: 0, scale: 1.25 },
    ],
    light: { x: 100, y: 300, z: 100, locked: false },
  },
  {
    id: 4,
    name: "Rotation",
    targetShapes: [
      { type: "rectangle", x: 500, y: 300, rotation: Math.PI / 4, scale: 2 },
    ],
    objects: [
      { id: "o1", type: "rectangle", x: 200, y: 300, rotation: 0, scale: 1 },
    ],
    light: { x: 100, y: 300, z: 100, locked: true },
  },
  {
    id: 5,
    name: "Abstract",
    targetShapes: [
      { type: "triangle", x: 450, y: 250, rotation: Math.PI, scale: 2 },
      { type: "triangle", x: 550, y: 350, rotation: 0, scale: 2 },
    ],
    objects: [
      { id: "o1", type: "triangle", x: 150, y: 400, rotation: 0, scale: 1 },
      { id: "o2", type: "triangle", x: 250, y: 400, rotation: 0, scale: 1 },
    ],
    light: { x: 100, y: 300, z: 100, locked: false },
  },
];

export function generateRandomLevel(id: number, difficulty: number): LevelData {
  const types: ShapeType[] = ['square', 'triangle', 'circle', 'rectangle'];
  const objects: GameObject[] = [];
  const targetShapes: any[] = [];
  
  // Number of objects increases with difficulty
  const numObjects = Math.min(6, 2 + Math.floor(difficulty / 2));
  
  // The "solution" light position
  const solLight = {
    x: 100 + Math.random() * 600,
    y: 100 + Math.random() * 400,
    z: 100 + Math.random() * 150,
  };
  
  const S = solLight.z / (solLight.z - 50);
  
  for (let i = 0; i < numObjects; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const scale = 0.5 + Math.random() * 1.0;
    const rotation = Math.random() * Math.PI * 2;
    
    // Solvable position
    const solX = 300 + Math.random() * 300;
    const solY = 200 + Math.random() * 200;
    
    const sx = solLight.x + (solX - solLight.x) * S;
    const sy = solLight.y + (solY - solLight.y) * S;
    
    targetShapes.push({
      type,
      x: sx,
      y: sy,
      rotation,
      scale: scale * S
    });
    
    // Scramble object starting position
    objects.push({
      id: `o${i}`,
      type,
      x: 100 + Math.random() * 600,
      y: 450 + Math.random() * 100,
      rotation: Math.random() * Math.PI * 2,
      scale
    });
  }
  
  // Scramble light starting position
  const startLight = {
    x: 100 + Math.random() * 600,
    y: 100 + Math.random() * 400,
    z: 100 + Math.random() * 150,
    locked: false
  };

  return {
    id,
    name: `Endless #${difficulty}`,
    targetShapes,
    objects,
    light: startLight
  };
}

export function getLevel(id: number): LevelData {
  const predefined = LEVELS.find((l) => l.id === id);
  if (predefined) return predefined;
  return generateRandomLevel(id, id - LEVELS.length + 1);
}
