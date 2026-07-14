import { useState, useCallback, useEffect } from 'react';
import { Point, pointsEqual } from '../utils/geometry';
import { bfsShortestPath, computeDistanceMatrix, buildFullPath, Grid } from '../utils/mazeAlgorithms';
import { solveNNDistanceMatrix, solveGADistanceMatrix } from '../utils/tspAlgorithms';

export type Level = 'easy' | 'medium' | 'hard';

export interface GameState {
  gridSize: number;
  grid: Grid;
  startNode: Point;
  treasures: Point[];      
  collected: Point[];      
  playerPos: Point;
  playerPath: Point[];     
  aiOptimalPath: Point[];  
  aiOptimalSteps: number;
  moves: number;
  level: Level;
  aiAlgorithm: 'nn' | 'ga';
  gameOver: boolean;
  scoreStars: number;
  efficiency: number;
}

function generateMaze(size: number, wallDensity: number, numTreasures: number) {
  let grid: Grid;
  let startNode: Point;
  let treasures: Point[] = [];
  
  while (true) {
    grid = Array(size).fill(0).map(() => Array(size).fill(0));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (Math.random() < wallDensity) grid[y][x] = 1;
      }
    }
    
    startNode = { x: 1, y: 1 };
    grid[startNode.y][startNode.x] = 0; 
    
    treasures = [];
    while (treasures.length < numTreasures) {
      const tx = Math.floor(Math.random() * size);
      const ty = Math.floor(Math.random() * size);
      if (grid[ty][tx] === 0 && !pointsEqual({x: tx, y: ty}, startNode) && !treasures.some(t => t.x === tx && t.y === ty)) {
        treasures.push({x: tx, y: ty});
      }
    }

    let allReachable = true;
    for (const t of treasures) {
      if (!bfsShortestPath(grid, startNode, t)) {
        allReachable = false;
        break;
      }
    }
    
    if (allReachable) break;
  }
  return { grid, startNode, treasures };
}

export function useMazeGame() {
  const [state, setState] = useState<GameState>({
    gridSize: 15,
    grid: [],
    startNode: {x: 0, y: 0},
    treasures: [],
    collected: [],
    playerPos: {x: 0, y: 0},
    playerPath: [],
    aiOptimalPath: [],
    aiOptimalSteps: 0,
    moves: 0,
    level: 'easy',
    aiAlgorithm: 'nn',
    gameOver: false,
    scoreStars: 0,
    efficiency: 0
  });

  const solveAI = useCallback((currentState?: GameState) => {
    setState(prev => {
      const targetState = currentState || prev;
      if (targetState.treasures.length === 0) return prev;
      
      const nodes = [targetState.startNode, ...targetState.treasures];
      const matrix = computeDistanceMatrix(targetState.grid, nodes);
      
      let optimalIndices: number[];
      if (targetState.aiAlgorithm === 'nn') {
        optimalIndices = solveNNDistanceMatrix(matrix, 0);
      } else {
        optimalIndices = solveGADistanceMatrix(matrix, 0);
      }

      const optimalNodes = optimalIndices.map(idx => nodes[idx]);
      const fullAiPath = buildFullPath(targetState.grid, optimalNodes);
      const aiSteps = fullAiPath.length > 0 ? fullAiPath.length - 1 : 0;

      let efficiency = targetState.efficiency;
      let scoreStars = targetState.scoreStars;
      if (targetState.gameOver) {
        efficiency = aiSteps > 0 ? (aiSteps / targetState.moves) * 100 : 0;
        if (efficiency >= 95) scoreStars = 3;
        else if (efficiency >= 75) scoreStars = 2;
        else scoreStars = 1;
      }

      return {
        ...targetState,
        aiOptimalPath: fullAiPath,
        aiOptimalSteps: aiSteps,
        efficiency,
        scoreStars
      };
    });
  }, []);

  const initializeLevel = useCallback((level: Level) => {
    const size = 15;
    let numTreasures = 5;
    let density = 0.15;
    if (level === 'medium') { numTreasures = 8; density = 0.2; }
    if (level === 'hard') { numTreasures = 15; density = 0.25; }
    
    setTimeout(() => {
      const { grid, startNode, treasures } = generateMaze(size, density, numTreasures);
      setState(prev => {
        const newState = {
          ...prev,
          gridSize: size,
          grid,
          startNode,
          treasures,
          collected: [],
          playerPos: startNode,
          playerPath: [startNode],
          aiOptimalPath: [],
          aiOptimalSteps: 0,
          moves: 0,
          level,
          gameOver: false,
          scoreStars: 0,
          efficiency: 0
        };
        return newState;
      });
      // Pre-calculate AI on level initialize so efficiency is ready visually
      setTimeout(() => solveAI(), 50);
    }, 0);
  }, [solveAI]);

  useEffect(() => {
    initializeLevel('easy');
  }, [initializeLevel]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setState(prev => {
      if (prev.gameOver) return prev;

      const nx = prev.playerPos.x + dx;
      const ny = prev.playerPos.y + dy;
      
      if (ny < 0 || ny >= prev.gridSize || nx < 0 || nx >= prev.gridSize || prev.grid[ny][nx] === 1) {
        return prev; 
      }

      const newPos = {x: nx, y: ny};
      const newPath = [...prev.playerPath, newPos];
      let newCollected = [...prev.collected];

      const tIdx = prev.treasures.findIndex(t => pointsEqual(t, newPos));
      if (tIdx !== -1 && !newCollected.some(c => pointsEqual(c, newPos))) {
        newCollected.push(prev.treasures[tIdx]);
      }

      const moves = prev.moves + 1;
      let gameOver: boolean = prev.gameOver;
      let scoreStars = prev.scoreStars;
      let efficiency = prev.efficiency;

      if (newCollected.length === prev.treasures.length && pointsEqual(newPos, prev.startNode)) {
        gameOver = true;
        efficiency = prev.aiOptimalSteps > 0 ? (prev.aiOptimalSteps / moves) * 100 : 0;
        if (efficiency >= 95) scoreStars = 3;
        else if (efficiency >= 75) scoreStars = 2;
        else scoreStars = 1;
      }

      return {
        ...prev,
        playerPos: newPos,
        playerPath: newPath,
        collected: newCollected,
        moves,
        gameOver,
        scoreStars,
        efficiency
      };
    });
  }, []);

  const setAiAlgorithm = useCallback((alg: 'nn' | 'ga') => {
    setState(prev => ({ ...prev, aiAlgorithm: alg }));
    setTimeout(() => solveAI(), 0);
  }, [solveAI]);

  return {
    ...state,
    initializeLevel,
    movePlayer,
    solveAI,
    setAiAlgorithm
  };
}
