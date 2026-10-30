import { useState, useEffect } from 'react';
import Modal from './Modal';
import './MealList.css';

const categories = [
  { key: 'Breakfast', label: 'Breakfast', icon: '☀️' },
  { key: 'Lunch', label: 'Lunch', icon: '🍴' },
  { key: 'Dinner', label: 'Dinner', icon: '🌙' },
  { key: 'Snacks', label: 'Snacks', icon: '🍎' }
];

// مفتاح الـ API من ملف .env (يعمل محلياً فقط)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// نماذج Gemini بالترتيب (Flash-Lite أولاً: أسرع وأرخص وأقل ازدحاماً، وتكفي لحساب السعرات)
// القائمة الحالية: https://ai.google.dev/gemini-api/docs/models
const AI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

const today = () => new Date().toDateString();
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// تحويل تصنيف الذكاء الاصطناعي لأحد التصنيفات الموجودة، وإلا Snacks
const normalizeCategory = (value) => {
  const match = categories.find(c => c.key.toLowerCase() === String(value || '').trim().toLowerCase());
  return match ? match.key : 'Snacks';
};

// رسالة واضحة لكل خطأ من سيرفر جوجل
const aiErrorMessage = (status) => {
  if (status === 402) return 'انتهى رصيد مفتاح الـ API. أضف رصيداً من AI Studio أو سجّل الوجبة يدوياً.';
  if (status === 503) return 'خدمة الذكاء الاصطناعي مزدحمة حالياً. حاول بعد دقيقة أو سجّل الوجبة يدوياً.';
  if (status === 429) return 'طلبات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.';
  if (status === 404) return 'نموذج الذكاء الاصطناعي غير متاح. حدّث اسم النموذج في MealList.jsx.';
  if (status === 400 || status === 401 || status === 403) return 'مفتاح الـ API مرفوض. تأكد من VITE_GEMINI_API_KEY في ملف .env.';
  return 'تعذّر الاتصال بالذكاء الاصطناعي. تحقق من الإنترنت أو سجّل الوجبة يدوياً.';
};

const emptyForm = { name: '', category: 'Breakfast', calories: '', protein: '', carbs: '', fat: '' };

function MealList({ meals, setMeals }) {
  // null = النافذة مغلقة، 'new' = إضافة، أو id الوجبة عند التعديل
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // حالة إدخال الوجبة بالذكاء الاصطناعي
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);

  // زر "Delete?" يرجع لحالته بعد 3 ثوانٍ لو ما ضغطت مرة ثانية (يحل مشكلة Safari)
  useEffect(() => {
    if (pendingDeleteId === null) return;
    const timer = setTimeout(() => setPendingDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [pendingDeleteId]);

  const updateField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleAiSmartLog = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || !apiKey || isAnalyzing) return;

    setIsAnalyzing(true);
    setAiMessage(null);

    const prompt = `You are an expert nutritionist. Analyze this meal description: "${aiInput}".
    Estimate the total calories, protein (g), carbs (g), and fat (g).
    Categorize it strictly into one of: "Breakfast", "Lunch", "Dinner", or "Snacks".
    Return ONLY a valid JSON object without any extra text, markdown, or formatting:
    {"name": "Short meal name in English or Arabic", "category": "Lunch", "calories": 400, "protein": 30, "carbs": 45, "fat": 12}`;

    // رابط الـ API المباشر لجوجل (المفتاح يُرسل في الـ header وليس في الرابط)
    const sendRequest = (model) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    try {
      // نجرب النماذج بالترتيب: لو نموذج مزدحم (503) أو غير متاح (404) ننتقل للتالي
      let response;
      for (const model of AI_MODELS) {
        response = await sendRequest(model);
        if (response.status !== 503 && response.status !== 404) break;
        console.warn(`AI model ${model} returned ${response.status}, trying next model`);
      }

      if (!response.ok) {
        console.error('AI server response:', await response.text());
        setAiMessage({ type: 'error', text: aiErrorMessage(response.status) });
        return;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = rawText?.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        setAiMessage({ type: 'error', text: 'لم أفهم الوصف. اكتبه بتفاصيل أكثر، مثل الكمية.' });
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      // يقبل أرقاماً مثل "400 kcal" ويرفض القيم السالبة
      const toAmount = (value) => Math.max(0, Math.round(parseFloat(value) || 0));
      const newMeal = {
        id: Date.now(),
        category: normalizeCategory(parsed.category),
        name: parsed.name || aiInput,
        date: today(),
        time: nowTime(),
        calories: toAmount(parsed.calories),
        protein: toAmount(parsed.protein),
        carbs: toAmount(parsed.carbs),
        fat: toAmount(parsed.fat)
      };

      setMeals(prev => [...prev, newMeal]);
      setAiInput('');
      setAiMessage({ type: 'success', text: `أُضيفت «${newMeal.name}» إلى ${newMeal.category} — ${newMeal.calories} kcal` });
    } catch (error) {
      console.error('AI Error:', error);
      setAiMessage({ type: 'error', text: aiErrorMessage() });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enter يرسل، Shift+Enter سطر جديد
  const handleAiKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleAiSmartLog(e);
  };

  const handleOpenAdd = (categoryKey) => {
    setForm({ ...emptyForm, category: categoryKey });
    setEditing('new');
  };

  const handleOpenEdit = (meal) => {
    setForm({
      name: meal.name,
      category: meal.category,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    });
    setEditing(meal.id);
  };

  // الحذف يحتاج ضغطتين: الأولى للتأكيد والثانية للحذف
  const handleDelete = (id) => {
    if (pendingDeleteId === id) {
      setMeals(prev => prev.filter(m => m.id !== id));
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  };

  const closeModal = () => setEditing(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const values = {
      name: form.name.trim(),
      category: form.category,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0
    };

    if (editing === 'new') {
      setMeals(prev => [...prev, { id: Date.now(), date: today(), time: nowTime(), ...values }]);
    } else {
      setMeals(prev => prev.map(m => m.id === editing ? { ...m, ...values } : m));
    }
    closeModal();
  };

  return (
    <div className="meal-list-section">
      <section className="ai-card" dir="rtl" lang="ar">
        <h2 className="ai-card-title">ماذا أكلت؟</h2>
        <p className="ai-card-hint">اكتب الوجبة والكمية، والذكاء الاصطناعي يحسب السعرات ويضيفها.</p>
        <form onSubmit={handleAiSmartLog} className="ai-form">
          <textarea
            id="ai-input"
            rows="2"
            aria-label="وصف الوجبة"
            placeholder="مثال: صحن كبسة مع قطعة دجاج وصحن شوربة عدس"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleAiKeyDown}
            disabled={!apiKey || isAnalyzing}
          />
          <button type="submit" className="btn btn-primary" disabled={!apiKey || isAnalyzing || !aiInput.trim()}>
            {isAnalyzing ? 'جاري الحساب…' : 'احسب وأضف'}
          </button>
        </form>
        {!apiKey && (
          <p className="ai-message">الذكاء الاصطناعي يعمل محلياً فقط. أضف VITE_GEMINI_API_KEY إلى ملف .env.</p>
        )}
        {aiMessage && (
          <p className={`ai-message ${aiMessage.type === 'error' ? 'is-error' : 'is-success'}`} role="status">
            {aiMessage.text}
          </p>
        )}
      </section>

      <h2 className="section-title">Today's meals</h2>

      {categories.map((cat) => {
        const categoryMeals = meals.filter(m => m.category === cat.key);
        const categoryTotal = categoryMeals.reduce((sum, m) => sum + Number(m.calories || 0), 0);

        return (
          <section key={cat.key} className="meal-category" aria-label={cat.label}>
            <div className="category-header">
              <h3 className="cat-label">
                <span aria-hidden="true">{cat.icon}</span> {cat.label}
                {categoryTotal > 0 && <span className="category-total">{categoryTotal} kcal</span>}
              </h3>
              <button
                type="button"
                className="add-meal-btn"
                onClick={() => handleOpenAdd(cat.key)}
                aria-label={`Add ${cat.label.toLowerCase()} manually`}
              >
                +
              </button>
            </div>

            {categoryMeals.length > 0 ? (
              categoryMeals.map((meal) => (
                <div key={meal.id} className="meal-card">
                  <button
                    type="button"
                    className="meal-main"
                    onClick={() => handleOpenEdit(meal)}
                    aria-label={`Edit ${meal.name}`}
                  >
                    <span className="meal-name" dir="auto">{meal.name}</span>
                    <span className="meal-meta">
                      <span>{meal.time}</span>
                      <span><span className="macro-dot protein" />P {meal.protein}g</span>
                      <span><span className="macro-dot carbs" />C {meal.carbs}g</span>
                      <span><span className="macro-dot fat" />F {meal.fat}g</span>
                    </span>
                  </button>
                  <div className="meal-cal">
                    <strong>{meal.calories}</strong>
                    <span>kcal</span>
                  </div>
                  <button
                    type="button"
                    className={`icon-btn ${pendingDeleteId === meal.id ? 'is-confirming' : ''}`}
                    onClick={() => handleDelete(meal.id)}
                    onBlur={() => setPendingDeleteId(null)}
                    aria-label={pendingDeleteId === meal.id ? `Confirm delete ${meal.name}` : `Delete ${meal.name}`}
                  >
                    {pendingDeleteId === meal.id ? 'Delete?' : '✕'}
                  </button>
                </div>
              ))
            ) : (
              <button type="button" className="empty-category" onClick={() => handleOpenAdd(cat.key)}>
                Nothing logged yet. Add {cat.label.toLowerCase()}
              </button>
            )}
          </section>
        );
      })}

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add meal' : 'Edit meal'} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="field">
              Meal name
              <input type="text" dir="auto" value={form.name} onChange={updateField('name')} required autoFocus />
            </label>
            <div className="field-row">
              <label className="field">
                Meal
                <select value={form.category} onChange={updateField('category')}>
                  {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </label>
              <label className="field">
                Calories (kcal)
                <input type="number" min="0" inputMode="numeric" value={form.calories} onChange={updateField('calories')} required />
              </label>
            </div>
            <div className="macro-inputs">
              <label className="field">
                Protein (g)
                <input type="number" min="0" step="any" inputMode="decimal" value={form.protein} onChange={updateField('protein')} />
              </label>
              <label className="field">
                Carbs (g)
                <input type="number" min="0" step="any" inputMode="decimal" value={form.carbs} onChange={updateField('carbs')} />
              </label>
              <label className="field">
                Fat (g)
                <input type="number" min="0" step="any" inputMode="decimal" value={form.fat} onChange={updateField('fat')} />
              </label>
            </div>
            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing === 'new' ? 'Add meal' : 'Save changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default MealList;
