
import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
        <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <div className="text-xl font-semibold">{formatTime(time)}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{formatDate(time)}</div>
      </div>
    </div>
  );
};

export default Clock;
