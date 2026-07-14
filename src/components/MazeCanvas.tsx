import { Point, pointsEqual } from '../utils/geometry';
import { Grid } from '../utils/mazeAlgorithms';

interface MazeCanvasProps {
  gridSize: number;
  grid: Grid;
  startNode: Point;
  treasures: Point[];
  collected: Point[];
  playerPos: Point;
  playerPath: Point[];
  aiOptimalPath: Point[];
  gameOver: boolean;
}

export function MazeCanvas({ gridSize, grid, startNode, treasures, collected, playerPos, playerPath, aiOptimalPath, gameOver }: MazeCanvasProps) {
  const S = 600 / gridSize;

  return (
    <div className="canvas-container" style={{ position: 'relative', width: 600, height: 600, margin: '0 auto' }}>
      <svg width={600} height={600} style={{ 
        background: 'rgba(15, 23, 42, 0.4)', 
        borderRadius: '8px', 
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'block'
      }}>
        {/* Draw Checkerboard Base */}
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <rect 
              key={`${x}-${y}`} 
              x={x * S} y={y * S} 
              width={S + 0.5 /* anti-aliasing fix */} height={S + 0.5} 
              fill={cell === 1 ? '#334155' : ((x+y)%2===0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)')}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          ))
        )}

        {/* Draw Start Node */}
        <rect x={startNode.x * S + 4} y={startNode.y * S + 4} width={S - 8} height={S - 8} fill="#3b82f6" rx="4" />
        <text x={startNode.x * S + S/2} y={startNode.y * S + S/2 + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">S</text>

        {/* Draw Uncollected Treasures */}
        {treasures.map(t => {
          if (collected.some(c => pointsEqual(c, t))) return null;
          return (
             <circle key={`t-${t.x}-${t.y}`} cx={t.x * S + S/2} cy={t.y * S + S/2} r={S/3} fill="#fbbf24" stroke="#fff" strokeWidth="2" />
          )
        })}

        {/* Draw Player Trail */}
        {playerPath.length > 1 && (
          <path 
            d={`M ${playerPath.map(p => `${p.x * S + S/2},${p.y * S + S/2}`).join(' L ')}`} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth={S/4} 
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.4"
          />
        )}

        {/* Draw AI Optimal Path (Only if Game Over or solved) */}
        {gameOver && aiOptimalPath.length > 1 && (
          <path 
            d={`M ${aiOptimalPath.map(p => `${p.x * S + S/2},${p.y * S + S/2}`).join(' L ')}`} 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth={S/6} 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ai-path-anim"
            strokeOpacity="0.8"
          />
        )}

        {/* Draw Player Token */}
        <circle 
           cx={playerPos.x * S + S/2} 
           cy={playerPos.y * S + S/2} 
           r={S/2.5} 
           fill="#10b981" 
           stroke="#fff" 
           strokeWidth="2"
           style={{ transition: 'all 0.1s linear' }}
        />
      </svg>
      {gameOver && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', zIndex: 10,
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}>
          <h2 style={{ color: '#fbbf24', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Mission Complete!</h2>
          <p style={{ color: 'white', fontSize: '1.2rem', textAlign: 'center', padding: '0 2rem' }}>You have collected all treasures and returned to start.</p>
        </div>
      )}
    </div>
  );
}
