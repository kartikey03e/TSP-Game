interface StatsPanelProps {
  moves: number;
  aiMoves: number;
  treasuresLeft: number;
  efficiency: number;
  stars: number;
  gameOver: boolean;
}

export function StatsPanel({ moves, aiMoves, treasuresLeft, efficiency, stars, gameOver }: StatsPanelProps) {
  return (
    <div className="stats-panel panel">
      <h2>Status</h2>
      <div className="stat-card">
        <h3>Treasures Left</h3>
        <div className="stat-value text-blue">{treasuresLeft}</div>
      </div>
      <div className="stat-card">
        <h3>Your Steps</h3>
        <div className="stat-value text-green">{moves}</div>
      </div>
      <div className="stat-card">
        <h3>AI Ideal Steps</h3>
        <div className="stat-value text-red">{aiMoves}</div>
        <p className="stat-hint">Math shortest path</p>
      </div>
      {gameOver && (
      <div className="stat-card" style={{ background: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)', marginTop: '1.5rem' }}>
        <h3 style={{ color: '#fbbf24' }}>Completion</h3>
        <div className="stat-value" style={{ color: '#fbbf24', fontSize: '1.75rem', letterSpacing: '4px' }}>
          {Array(stars).fill('⭐').join('')}{Array(3-stars).fill('☆').join('')}
        </div>
        <p className="stat-hint" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>{efficiency.toFixed(1)}% Efficiency</p>
      </div>
      )}
    </div>
  )
}
