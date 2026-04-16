import { useApp } from '../context/AppContext';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';
import './Toast.css';

export default function Toast() {
  const { toasts } = useApp();

  const icons = {
    success: <FiCheck />,
    error: <FiX />,
    warning: <FiAlertCircle />,
    info: <FiInfo />,
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{icons[toast.type] || icons.info}</span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
