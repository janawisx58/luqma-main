import { useEffect, useId } from 'react';
import './Modal.css';

// نافذة منبثقة مشتركة: تُغلق بزر Esc أو بالضغط خارجها
function Modal({ title, onClose, children }) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
