
import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = format(currentTime, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(currentTime, "HH:mm:ss");

  return (
    <div className="bg-gradient-to-r from-slate-800/70 to-indigo-900/60 p-4 rounded-xl backdrop-blur-sm shadow-lg border border-slate-700/40 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-300">
          <Calendar className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-medium capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-medium">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
