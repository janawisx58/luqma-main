import React, { useState } from 'react';
import './WelcomeModal.css';

export default function WelcomeModal({ onSave }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !weight || !age) {
      alert('يرجى ملء جميع الحقل لمتابعة الاستخدام');
      return;
    }
    onSave({ name: name.trim(), weight, age });
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <h2>مرحباً بكِ في تطبيق لقمة 🥗</h2>
        <p>الرجاء إدخال بياناتكِ الشخصية لنبدأ رحلة تتبع السعرات:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="welcome-form-group">
            <label>الاسم الكريم:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="أدخل اسمك..." 
              required 
            />
          </div>

          <div className="welcome-form-group">
            <label>الوزن (كغ):</label>
            <input 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              placeholder="مثال: 60" 
              required 
            />
          </div>

          <div className="welcome-form-group">
            <label>العمر:</label>
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              placeholder="مثال: 21" 
              required 
            />
          </div>

          <button type="submit" className="welcome-submit-btn">حفظ ومتابعة</button>
        </form>
      </div>
    </div>
  );
}