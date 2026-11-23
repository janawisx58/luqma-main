import './BottomNav.css';

// زر لصفحة لم تُبنَ بعد (معطّل)
function SoonButton({ icon, label }) {
  return (
    <button type="button" className="nav-btn disabled" title="Coming soon">
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

function BottomNav({ activeTab = 'today', onTabChange = () => {} }) {
  // زر + ينقلك لصندوق الذكاء الاصطناعي
  const focusAiInput = () => {
    if (activeTab !== 'today') {
      onTabChange('today');
      setTimeout(() => {
        const input = document.getElementById('ai-input');
        if (!input) return;
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus({ preventScroll: true });
      }, 80);
      return;
    }

    const input = document.getElementById('ai-input');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
  };

  return (
    <nav className="bottom-nav" aria-label="Main">
      <button
        type="button"
        className={`nav-btn ${activeTab === 'today' ? 'active' : ''}`}
        aria-current={activeTab === 'today' ? 'page' : undefined}
        onClick={() => onTabChange('today')}
      >
        <span className="nav-icon" aria-hidden="true">🏠</span>
        Today
      </button>

      <button
        type="button"
        className={`nav-btn ${activeTab === 'progress' ? 'active' : ''}`}
        aria-current={activeTab === 'progress' ? 'page' : undefined}
        onClick={() => onTabChange('progress')}
      >
        <span className="nav-icon" aria-hidden="true">📈</span>
        Progress
      </button>

      <button type="button" className="log-btn" onClick={focusAiInput} aria-label="Log a meal">
        +
      </button>

      <SoonButton icon="📖" label="Recipes" />
      <SoonButton icon="👤" label="Settings" />
    </nav>
  );
} 
export default BottomNav;