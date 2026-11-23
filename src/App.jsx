import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import CalorieCard from './components/CalorieCard';
import MealList from './components/MealList';
import WelcomeModal from './components/WelcomeModal'; // نافذة الترحيب الجديدة
import ProgressTracker from './components/ProgressTracker'; // قسم سجل التقدم اليومي

const today = () => new Date().toDateString();

const loadMeals = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('luqma_meals'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [meals, setMeals] = useState(loadMeals);
  const [goal, setGoal] = useState(() => Number(localStorage.getItem('luqma_goal')) || 2000);
  const [activeTab, setActiveTab] = useState('today');

  // حالة بيانات المستخدم (الاسم، الطول، الوزن، العمر، الجنس)
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('luqma_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSaveUser = (data, initialGoal) => {
    setUserData(data);
    localStorage.setItem('luqma_user', JSON.stringify(data));
    if (typeof initialGoal === 'number' && initialGoal > 0) {
      setGoal(initialGoal);
    }
  };

  useEffect(() => {
    localStorage.setItem('luqma_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('luqma_goal', goal);
  }, [goal]);

  const todayMeals = meals.filter(m => m.date === today());
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <>
      {/* نافذة الترحيب تظهر أول مرة فقط */}
      {!userData && <WelcomeModal onSave={handleSaveUser} />}

      <div className="app-container">
        {/* شريط علوي يظهر اسم المستخدم ووزنه وعمره */}
        {userData && (
          <div style={{
            background: '#2a2a2a',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            borderBottom: '1px solid #444',
            direction: 'rtl',
            fontSize: '0.9rem'
          }}>
            <div>
              <span style={{ color: '#ff9800', fontWeight: 'bold' }}>الاسم: </span>{userData.name}
            </div>
            <div>
              <span style={{ color: '#ff9800', fontWeight: 'bold' }}>الوزن: </span>{userData.weight} كغ |{' '}
              <span style={{ color: '#ff9800', fontWeight: 'bold' }}>العمر: </span>{userData.age} سنة
            </div>
          </div>
        )}

        <header className="app-header">
          <h1 className="wordmark">
            <span lang="ar">لقمة</span>
            <span className="wordmark-latin">Luqma</span>
          </h1>
          <p className="today-date">{dateLabel}</p>
        </header>

        <main>
          {activeTab === 'today' ? (
            <>
              <CalorieCard meals={todayMeals} goal={goal} onGoalChange={setGoal} />
              <MealList meals={todayMeals} setMeals={setMeals} />
            </>
          ) : (
            <ProgressTracker meals={meals} goal={goal} />
          )}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* اسمك في أسفل المشروع */}
        <footer style={{
          textAlign: 'center',
          padding: '15px',
          color: '#888',
          fontSize: '0.85rem',
          borderTop: '1px solid #333',
          marginTop: '20px',
          direction: 'rtl'
        }}>
          تم التطوير بواسطة: Jana'-'Tattan ✨
        </footer>
      </div>
    </>
  );
}