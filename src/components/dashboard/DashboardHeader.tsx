
import React from "react";
import { Search } from "lucide-react";
import DateTimeDisplay from "./DateTimeDisplay";
import NotificationCenter from "./NotificationCenter";
import UserPreferences from "./UserPreferences";

interface DashboardHeaderProps {
  userId: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userId }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <DateTimeDisplay />
      
      <div className="flex items-center gap-3">
        <div className="relative flex-grow max-w-xs">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 shadow-md"
          />
        </div>
        
        <NotificationCenter />
        <UserPreferences userId={userId} />
      </div>
    </div>
  );
};

export default DashboardHeader;
