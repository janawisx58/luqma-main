import React, { useState, useMemo } from 'react';

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
];

export default function ProgressTracker({ meals = [], goal = 2000 }) {
  const [openDate, setOpenDate] = useState(() => new Date().toDateString());

  const daysHistory = useMemo(() => {
    const mapByDate = {};

    meals.forEach((meal) => {
      const dateKey = meal.date || new Date().toDateString();
      if (!mapByDate[dateKey]) {
        mapByDate[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          items: [],
        };
      }

      mapByDate[dateKey].calories += Number(meal.calories || 0);
      mapByDate[dateKey].protein += Number(meal.protein || 0);
      mapByDate[dateKey].carbs += Number(meal.carbs || 0);
      mapByDate[dateKey].fat += Number(meal.fat || 0);
      mapByDate[dateKey].items.push(meal);
    });

    return Object.values(mapByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [meals]);

  const formatDayTitle = (dateStr) => {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;

    const formatted = parsed.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (dateStr === new Date().toDateString()) {
      return `Today · ${formatted}`;
    }
    return formatted;
  };

  return (
    <section
      className="progress-section"
      aria-label="Daily progress history"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '12px 0 84px',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 210, 155, 0.25)',
          borderRadius: '18px',
          padding: '16px',
          textAlign: 'right',
          direction: 'rtl',
        }}
      >
        <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#ffd29b' }}>
          سجل التقدم اليومي
        </h2>
        <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.85 }}>
          كل يوم محفوظ تلقائياً مع مجموع السعرات، الماكروز، والوجبات يلي أكلتيها.
        </p>
      </div>

      {daysHistory.length === 0 ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 210, 155, 0.2)',
            borderRadius: '18px',
            padding: '24px 16px',
            textAlign: 'center',
            opacity: 0.85,
            direction: 'rtl',
          }}
        >
          لسا ما في أي أيام مسجلة بالسجل. بس تضيفي وجبة من تبويب Today رح يظهر اليوم هون تلقائياً.
        </div>
      ) : (
        daysHistory.map((day) => {
          const isOpen = openDate === day.date;
          const pct =
            goal > 0 ? Math.min(100, Math.round((day.calories / goal) * 100)) : 0;

          return (
            <div
              key={day.date}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: isOpen
                  ? '1px solid #ff9800'
                  : '1px solid rgba(255, 210, 155, 0.22)',
                borderRadius: '18px',
                padding: '14px 16px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenDate(isOpen ? null : day.date)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <strong style={{ fontSize: '0.98rem', color: '#fff' }}>
                    {formatDayTitle(day.date)}
                  </strong>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: '#ff9800',
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(day.calories).toLocaleString()} /{' '}
                    {Number(goal || 0).toLocaleString()} kcal
                  </span>
                </div>

                {/* شريط تقدم اليوم */}
                <div
                  style={{
                    height: '7px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.14)',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: '#ff9800',
                      borderRadius: '999px',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>

                {/* الماكروز وعدد الوجبات */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '0.82rem',
                    opacity: 0.92,
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {MACROS.map((m) => (
                      <span key={m.key}>
                        {m.label}: <strong>{Math.round(day[m.key])}g</strong>
                      </span>
                    ))}
                  </div>

                  <span style={{ color: '#ffd29b', fontWeight: '600' }}>
                    {isOpen
                      ? 'Hide meals ▲'
                      : `Meals (${day.items.length}) ▼`}
                  </span>
                </div>
              </button>

              {/* قائمة الوجبات لليوم المختار */}
              {isOpen && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {day.items.map((meal, index) => (
                    <div
                      key={meal.id || `${day.date}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        fontSize: '0.88rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff' }}>
                          {meal.name || meal.title || 'Meal'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            opacity: 0.8,
                            marginTop: '2px',
                          }}
                        >
                          Protein: {Math.round(Number(meal.protein || 0))}g · Carbs:{' '}
                          {Math.round(Number(meal.carbs || 0))}g · Fat:{' '}
                          {Math.round(Number(meal.fat || 0))}g
                        </div>
                      </div>
                      <strong style={{ color: '#ffd29b', whiteSpace: 'nowrap' }}>
                        {Math.round(Number(meal.calories || 0)).toLocaleString()} kcal
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}