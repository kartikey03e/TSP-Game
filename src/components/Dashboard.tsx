import { Level } from '../hooks/useMazeGame';

interface DashboardProps {
  level: Level;
  aiAlgorithm: 'nn' | 'ga';
  onLevelChange: (l: Level) => void;
  onAlgorithmChange: (alg: 'nn' | 'ga') => void;
  onRestart: () => void;
}

export function Dashboard({ level, aiAlgorithm, onLevelChange, onAlgorithmChange, onRestart }: DashboardProps) {
  return (
    <div className="dashboard-panel panel">
      <h2>Controls</h2>
      <div className="control-group">
        <label>Difficulty:</label>
        <select value={level} onChange={(e) => onLevelChange(e.target.value as Level)} className="modern-select">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="control-group">
        <label>AI Solver Model:</label>
        <select value={aiAlgorithm} onChange={(e) => onAlgorithmChange(e.target.value as 'nn' | 'ga')} className="modern-select">
          <option value="nn">Nearest Neighbor</option>
          <option value="ga">Genetic Algorithm</option>
        </select>
      </div>

      <div className="control-group buttons">
        <button className="btn-solve" onClick={onRestart}>Restart Board</button>
      </div>
    </div>
  )
}
