import React from 'react';
import { X, AlertTriangle, Heart, Zap } from 'lucide-react';

interface MotivationAlertProps {
  message: string;
  onClose: () => void;
  type?: 'reminder' | 'warning' | 'motivation';
}

const MotivationAlert: React.FC<MotivationAlertProps> = ({ 
  message, 
  onClose, 
  type = 'reminder' 
}) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-500',
          icon: AlertTriangle,
          iconColor: 'text-red-100'
        };
      case 'motivation':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          icon: Zap,
          iconColor: 'text-purple-100'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: Heart,
          iconColor: 'text-emerald-100'
        };
    }
  };

  const style = getAlertStyle();
  const Icon = style.icon;

  return (
    <div className={`${style.bg} rounded-xl p-6 text-white shadow-lg border border-white/20 animate-pulse`}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg bg-white/20 ${style.iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-2">
            {type === 'warning' ? '⚠️ Important Reminder' : 
             type === 'motivation' ? '🔥 Motivation Boost' : 
             '💝 Friendly Reminder'}
          </h3>
          <p className="text-white/90">{message}</p>
        </div>
        
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MotivationAlert;