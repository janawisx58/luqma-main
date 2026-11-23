import React, { useState, useEffect } from 'react';
import './WelcomeModal.css';

// حساب الاحتياج اليومي التقريبي للسعرات (Mifflin-St Jeor × معامل نشاط 1.375)
function calculateRecommendedCalories({ weight, height, age, gender }) {
  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) {
    return null;
  }

  const baseBmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161);
  const total = Math.round((baseBmr * 1.375) / 10) * 10;
  return Math.max(1000, total);
}

export default function WelcomeModal({ onSave }) {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');

  const [recommendedGoal, setRecommendedGoal] = useState(null);
  const [customGoal, setCustomGoal] = useState('');
  const [isManualGoal, setIsManualGoal] = useState(false);

  useEffect(() => {
    const calc = calculateRecommendedCalories({ weight, height, age, gender });
    setRecommendedGoal(calc);

    if (calc !== null && !isManualGoal) {
      setCustomGoal(String(calc));
    }
  }, [weight, height, age, gender, isManualGoal]);

  const handleGoalChange = (e) => {
    setIsManualGoal(true);
    setCustomGoal(e.target.value);
  };

  const handleUseRecommended = () => {
    if (recommendedGoal !== null) {
      setIsManualGoal(false);
      setCustomGoal(String(recommendedGoal));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalGoal = Number(customGoal) || recommendedGoal || 2000;

    onSave(
      {
        name: name.trim(),
        height: Number(height),
        weight: Number(weight),
        age: Number(age),
        gender,
      },
      finalGoal
    );
  };

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-modal">
        <h2 id="welcome-title">أهلاً بك في لقمة</h2>
        <p>أدخل بياناتك لنحسب احتياجك اليومي تلقائياً، ويمكنك تعديل الرقم يدوياً حسب هدفك.</p>

        <form onSubmit={handleSubmit}>
          <div className="welcome-form-group">
            <label htmlFor="welcome-name">الاسم</label>
            <input
              id="welcome-name"
              type="text"
              placeholder="مثال: جنى"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="welcome-form-group">
            <label htmlFor="welcome-gender">الجنس</label>
            <select
              id="welcome-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
              }}
            >
              <option value="female">أنثى</option>
              <option value="male">ذكر</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="welcome-form-group">
              <label htmlFor="welcome-height">الطول (سم)</label>
              <input
                id="welcome-height"
                type="number"
                min="80"
                max="250"
                placeholder="165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>

            <div className="welcome-form-group">
              <label htmlFor="welcome-weight">الوزن (كغ)</label>
              <input
                id="welcome-weight"
                type="number"
                min="25"
                max="300"
                placeholder="55"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>

            <div className="welcome-form-group">
              <label htmlFor="welcome-age">العمر</label>
              <input
                id="welcome-age"
                type="number"
                min="5"
                max="120"
                placeholder="19"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>

          {recommendedGoal !== null && (
            <div
              style={{
                background: 'rgba(255, 152, 0, 0.12)',
                border: '1px solid rgba(255, 152, 0, 0.45)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div>
                الاحتياج المقترح لك:{' '}
                <strong style={{ color: '#ff9800' }}>
                  {recommendedGoal.toLocaleString()} سعرة
                </strong>
              </div>

              {isManualGoal && String(recommendedGoal) !== customGoal && (
                <button
                  type="button"
                  onClick={handleUseRecommended}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff9800',
                    color: '#ff9800',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  اعتماد المحسوب
                </button>
              )}
            </div>
          )}

          <div className="welcome-form-group">
            <label htmlFor="welcome-goal">الهدف اليومي للسعرات (يمكنك تعديله يدوياً)</label>
            <input
              id="welcome-goal"
              type="number"
              min="500"
              max="15000"
              step="10"
              placeholder="اكتب هدفك اليومي من السعرات"
              value={customGoal}
              onChange={handleGoalChange}
              required
            />
          </div>

          <button type="submit" className="welcome-submit-btn">
            حفظ وبدء الاستخدام
          </button>
        </form>
      </div>
    </div>
  );
}