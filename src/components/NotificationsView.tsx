import React from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useApp();

  const unread = notifications.filter(n => !n.read);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span>Central de Notificações</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Acompanhe atualizações de agendamentos e alertas em tempo real
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-zinc-400" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">Nenhuma notificação por enquanto</p>
          <p className="text-xs text-zinc-500">As atualizações da sua agenda e clientes aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`
                p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer
                ${notif.read 
                  ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400' 
                  : 'bg-zinc-900 border-blue-500/40 text-zinc-100 shadow-lg shadow-blue-500/5'}
              `}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                notif.type === 'booking' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                notif.type === 'cancellation' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold ${notif.read ? 'text-zinc-300' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
