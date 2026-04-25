import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-success' },
    error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-critical' },
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-600' },
  }[toast.type] || {};

  const Icon = config.icon;

  return (
    <div className="fixed top-5 right-5 z-50 animate-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-card-hover ${config.bg} ${config.border}`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <div className={`text-sm font-medium ${config.text}`}>{toast.message}</div>
      </div>
    </div>
  );
}
