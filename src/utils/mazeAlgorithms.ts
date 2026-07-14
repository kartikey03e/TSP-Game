import { Point, pointsEqual } from './geometry';

export type Grid = number[][]; // 0: empty, 1: wall

const DIRS = [ {dx: 0, dy: -1}, {dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: -1, dy: 0} ];

export function getNeighbors(grid: Grid, p: Point): Point[] {
  const neighbors: Point[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  
  for (const {dx, dy} of DIRS) {
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] !== 1) {
      neighbors.push({x: nx, y: ny});
    }
  }
  return neighbors;
}

// Find shortest path between structural grid points using BFS
export function bfsShortestPath(grid: Grid, start: Point, end: Point): Point[] | null {
  if (pointsEqual(start, end)) return [start];
  if (grid[start.y][start.x] === 1 || grid[end.y][end.x] === 1) return null;

  const queue: Point[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);
  
  const parentMap = new Map<string, Point>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (pointsEqual(curr, end)) {
      const path: Point[] = [];
      let step: Point | undefined = curr;
      while (step) {
        path.unshift(step);
        step = parentMap.get(`${step.x},${step.y}`);
      }
      return path;
    }

    for (const n of getNeighbors(grid, curr)) {
      const key = `${n.x},${n.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(key, curr);
        queue.push(n);
      }
    }
  }
  return null;
}

// Computes a fully connected graph matching TSP distance matrix from BFS
export function computeDistanceMatrix(grid: Grid, nodes: Point[]): number[][] {
  const matrix: number[][] = Array(nodes.length).fill(0).map(() => Array(nodes.length).fill(Infinity));
  
  for (let i = 0; i < nodes.length; i++) {
    const start = nodes[i];
    const distances = new Map<string, number>();
    const queue: {p: Point, dist: number}[] = [{p: start, dist: 0}];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);
    distances.set(`${start.x},${start.y}`, 0);

    while(queue.length > 0) {
      const {p: curr, dist} = queue.shift()!;
      for (const n of getNeighbors(grid, curr)) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          distances.set(key, dist + 1);
          queue.push({p: n, dist: dist + 1});
        }
      }
    }

    for (let j = 0; j < nodes.length; j++) {
      const key = `${nodes[j].x},${nodes[j].y}`;
      if (distances.has(key)) {
        matrix[i][j] = distances.get(key)!;
      }
    }
  }
  return matrix;
}

export function buildFullPath(grid: Grid, nodeSequence: Point[]): Point[] {
  const full: Point[] = [];
  for (let i = 0; i < nodeSequence.length - 1; i++) {
    const path = bfsShortestPath(grid, nodeSequence[i], nodeSequence[i+1]);
    if (path) {
      if (i > 0) path.shift();
      full.push(...path);
    }
  }
  return full;
}
