import { useState } from 'react';
import Modal from './Modal';
import './CalorieCard.css';

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const macros = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' }
];

function CalorieCard({ meals, goal, onGoalChange }) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  const eaten = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const difference = goal - eaten;
  const isOver = goal > 0 && difference < 0;
  // نسبة تعبئة الصحن (من 0 إلى 1)
  const progress = goal > 0 ? Math.min(1, eaten / goal) : 0;

  const macroTotals = macros.map(m => ({
    ...m,
    grams: meals.reduce((sum, meal) => sum + Number(meal[m.key] || 0), 0)
  }));
  const macroSum = macroTotals.reduce((sum, m) => sum + m.grams, 0);

  const openGoalEditor = () => {
    setTempGoal(goal || '');
    setIsEditingGoal(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    onGoalChange(Number(tempGoal) || 0);
    setIsEditingGoal(false);
  };

  return (
    <section className="calorie-card" aria-label="Today's calories">
      {/* الدائرة مرسومة كصحن: الحافة تمتلئ كلما أكلت */}
      <div className={`plate ${isOver ? 'is-over' : ''}`}>
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle className="plate-track" cx="80" cy="80" r={RADIUS} />
          {progress > 0 && (
            <circle
              className="plate-fill"
              cx="80"
              cy="80"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            />
          )}
        </svg>
        <div className="plate-center">
          {goal > 0 ? (
            <>
              <span className="plate-number">{Math.abs(difference).toLocaleString()}</span>
              <span className="plate-unit">{isOver ? 'kcal over' : 'kcal left'}</span>
            </>
          ) : (
            <button type="button" className="set-goal-btn" onClick={openGoalEditor}>
              Set daily goal
            </button>
          )}
        </div>
      </div>

      <dl className="card-stats">
        <div>
          <dt>Eaten</dt>
          <dd>{eaten.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Goal</dt>
          <dd>
            <button type="button" className="goal-btn" onClick={openGoalEditor} aria-label="Edit daily goal">
              {goal > 0 ? goal.toLocaleString() : 'Not set'}
            </button>
          </dd>
        </div>
      </dl>

      <div className="macros">
        <div className="macro-bar" aria-hidden="true">
          {macroSum > 0 && macroTotals.map(m => (
            <span key={m.key} className={`macro-seg ${m.key}`} style={{ flexGrow: m.grams }} />
          ))}
        </div>
        <ul className="macro-legend">
          {macroTotals.map(m => (
            <li key={m.key}>
              <span className={`macro-dot ${m.key}`} aria-hidden="true" />
              {m.label} <strong>{m.grams}g</strong>
            </li>
          ))}
        </ul>
      </div>

      {isEditingGoal && (
        <Modal title="Daily calorie goal" onClose={() => setIsEditingGoal(false)}>
          <form className="modal-form" onSubmit={handleSaveGoal}>
            <label className="field">
              Calories per day
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="2000"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                autoFocus
                required
              />
            </label>
            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditingGoal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save goal</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default CalorieCard;
