import './BottomNav.css';

// زر لصفحة لم تُبنَ بعد (معطّل)
function SoonButton({ icon, label }) {
  return (
    <button type="button" className="nav-btn" disabled title="Coming soon">
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

function BottomNav() {
  // زر + ينقلك لصندوق الذكاء الاصطناعي
  const focusAiInput = () => {
    const input = document.getElementById('ai-input');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
  };

  return (
    <nav className="bottom-nav" aria-label="Main">
      <button type="button" className="nav-btn active" aria-current="page">
        <span className="nav-icon" aria-hidden="true">🏠</span>
        Today
      </button>
      <SoonButton icon="📈" label="Progress" />

      <button type="button" className="log-btn" onClick={focusAiInput} aria-label="Log a meal">
        +
      </button>

      <SoonButton icon="📖" label="Recipes" />
      <SoonButton icon="👤" label="Settings" />
    </nav>
  );
}

export default BottomNav;
