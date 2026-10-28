import { useToast } from '../../context/ToastContext.jsx';
import Icon from './Icon.jsx';

export default function Toasts() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={`toast toast--${x.type}`}>
          <Icon name={x.type === 'error' ? 'info' : 'check'} size={18} />
          <span>{x.message}</span>
          <button className="toast__x" onClick={() => dismiss(x.id)} aria-label="close"><Icon name="close" size={14} /></button>
        </div>
      ))}
    </div>
  );
}
