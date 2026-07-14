// Nearest Neighbor Algorithm using a Distance Matrix
export function solveNNDistanceMatrix(matrix: number[][], startIndex: number = 0): number[] {
  if (matrix.length === 0) return [];
  if (matrix.length === 1) return [0, 0]; // Self loop if only 1 node

  const unvisited = new Set(Array.from({length: matrix.length}, (_, i) => i));
  const path: number[] = [];
  
  let current = startIndex;
  unvisited.delete(current);
  path.push(current);

  while (unvisited.size > 0) {
    let nearestIdx = -1;
    let minDist = Infinity;
    for (const distIdx of unvisited) {
      if (matrix[current][distIdx] < minDist) {
        minDist = matrix[current][distIdx];
        nearestIdx = distIdx;
      }
    }
    if (nearestIdx === -1) break; // unreachable
    current = nearestIdx;
    unvisited.delete(current);
    path.push(current);
  }

  // Return to start
  path.push(startIndex);
  return path;
}

// Genetic Algorithm using Distance Matrix
export function solveGADistanceMatrix(matrix: number[][], startIndex: number = 0, popSize = 100, gens = 200, mutRate = 0.05): number[] {
  const numNodes = matrix.length;
  if (numNodes <= 3) return solveNNDistanceMatrix(matrix, startIndex);

  const nodeIndices = Array.from({length: numNodes}, (_, i) => i).filter(i => i !== startIndex);

  function createRandomPath(): number[] {
    const path = [...nodeIndices];
    for (let i = path.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [path[i], path[j]] = [path[j], path[i]];
    }
    return [startIndex, ...path, startIndex];
  }

  function getPathDistance(path: number[]): number {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      if (matrix[path[i]][path[i+1]] === Infinity) return Infinity;
      dist += matrix[path[i]][path[i+1]];
    }
    return dist;
  }

  function crossover(p1: number[], p2: number[]): number[] {
    const parent1 = p1.slice(1, -1);
    const parent2 = p2.slice(1, -1);

    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * parent1.length);
    const [min, max] = [Math.min(start, end), Math.max(start, end)];
    
    const child = new Array(parent1.length).fill(-1);
    for (let i = min; i <= max; i++) {
      child[i] = parent1[i];
    }
    
    let currentIdx = 0;
    for (let i = 0; i < parent2.length; i++) {
      if (!child.includes(parent2[i])) {
        while (child[currentIdx] !== -1) currentIdx++;
        if (currentIdx < child.length) {
           child[currentIdx] = parent2[i];
        }
      }
    }
    return [startIndex, ...child, startIndex];
  }

  function mutate(path: number[]): number[] {
    const inner = path.slice(1, -1);
    for (let i = 0; i < inner.length; i++) {
      if (Math.random() < mutRate) {
        const j = Math.floor(Math.random() * inner.length);
        [inner[i], inner[j]] = [inner[j], inner[i]];
      }
    }
    return [startIndex, ...inner, startIndex];
  }

  let population: number[][] = Array.from({ length: popSize }, createRandomPath);
  let bestPath: number[] = population[0];
  let bestDistance = getPathDistance(bestPath);

  for (let g = 0; g < gens; g++) {
    population.sort((a, b) => getPathDistance(a) - getPathDistance(b)); 
    
    const currentBestDist = getPathDistance(population[0]);
    if (currentBestDist < bestDistance) {
      bestDistance = currentBestDist;
      bestPath = [...population[0]];
    }

    const newPopulation: number[][] = [];
    newPopulation.push(population[0]); 
    newPopulation.push(population[1]);

    while (newPopulation.length < popSize) {
      const selectParent = () => {
        const p1 = population[Math.floor(Math.random() * population.length)];
        const p2 = population[Math.floor(Math.random() * population.length)];
        return getPathDistance(p1) < getPathDistance(p2) ? p1 : p2;
      };

      let child = crossover(selectParent(), selectParent());
      child = mutate(child);
      newPopulation.push(child);
    }
    population = newPopulation;
  }

  return bestPath;
}
