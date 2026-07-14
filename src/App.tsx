import { useEffect } from 'react';
import './index.css';

import { useMazeGame } from './hooks/useMazeGame';
import { MazeCanvas } from './components/MazeCanvas';
import { Dashboard } from './components/Dashboard';
import { StatsPanel } from './components/StatsPanel';

function App() {
  const game = useMazeGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': game.movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': game.movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': game.movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': game.movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Treasure Hunter Maze</h1>
        <p>Use Arrows/WASD to collect all treasures and return to Start via shortest path!</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Dashboard 
            level={game.level} 
            aiAlgorithm={game.aiAlgorithm}
            onLevelChange={game.initializeLevel}
            onAlgorithmChange={game.setAiAlgorithm}
            onRestart={() => game.initializeLevel(game.level)}
          />
          <StatsPanel 
            moves={game.moves}
            aiMoves={game.aiOptimalSteps}
            treasuresLeft={game.treasures.length - game.collected.length}
            efficiency={game.efficiency}
            stars={game.scoreStars}
            gameOver={game.gameOver}
          />
        </aside>

        <main className="main-content">
          <MazeCanvas 
            gridSize={game.gridSize}
            grid={game.grid}
            startNode={game.startNode}
            treasures={game.treasures}
            collected={game.collected}
            playerPos={game.playerPos}
            playerPath={game.playerPath}
            aiOptimalPath={game.aiOptimalPath}
            gameOver={game.gameOver}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
