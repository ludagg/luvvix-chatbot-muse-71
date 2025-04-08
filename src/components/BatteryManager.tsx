
import { useState, useEffect } from "react";
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface BatteryManagerProps {
  className?: string;
}

export const BatteryManager = ({ className }: BatteryManagerProps) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);
  const [powerSavingMode, setPowerSavingMode] = useLocalStorage<boolean>("power-saving-mode", false);
  const [autoEnablePowerSaving, setAutoEnablePowerSaving] = useLocalStorage<boolean>("auto-power-saving", true);
  
  // Check if browser supports Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
      const updateBatteryStatus = (battery: any) => {
        setBatteryLevel(battery.level * 100);
        setIsCharging(battery.charging);
        
        // Auto enable power saving mode when battery is low and not charging
        if (autoEnablePowerSaving && battery.level <= 0.2 && !battery.charging && !powerSavingMode) {
          setPowerSavingMode(true);
          toast.info("Mode économie d'énergie activé automatiquement en raison d'une batterie faible");
        }
      };
      
      const setupBattery = async () => {
        try {
          const battery: any = await (navigator as any).getBattery();
          updateBatteryStatus(battery);
          
          // Add event listeners
          battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
          battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
        } catch (error) {
          console.error('Battery API error:', error);
          setBatterySupported(false);
        }
      };
      
      setupBattery();
    } else {
      setBatterySupported(false);
    }
  }, [autoEnablePowerSaving, powerSavingMode, setPowerSavingMode]);

  // Apply power saving optimizations
  useEffect(() => {
    if (powerSavingMode) {
      // Apply power saving CSS class to reduce animations
      document.documentElement.classList.add('power-saving');
      
      // Reduce animation frame rate
      const styleElement = document.createElement('style');
      styleElement.id = 'power-saving-styles';
      styleElement.textContent = `
        * {
          animation-duration: 0.5s !important;
          transition-duration: 0.5s !important;
        }
        .animate-pulse {
          animation: none !important;
        }
        .animate-spin {
          animation-duration: 2s !important;
        }
        canvas {
          opacity: 0.1 !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => {
        document.documentElement.classList.remove('power-saving');
        const element = document.getElementById('power-saving-styles');
        if (element) element.remove();
      };
    }
  }, [powerSavingMode]);

  // Toggle power saving mode
  const togglePowerSavingMode = () => {
    setPowerSavingMode(!powerSavingMode);
    toast.success(powerSavingMode ? 
      "Mode économie d'énergie désactivé" : 
      "Mode économie d'énergie activé");
  };

  // Toggle auto power saving
  const toggleAutoPowerSaving = () => {
    setAutoEnablePowerSaving(!autoEnablePowerSaving);
  };

  const getBatteryIcon = () => {
    if (!batterySupported || batteryLevel === null) return <Battery />;
    if (isCharging) return <BatteryFull className="text-green-500" />;
    
    if (batteryLevel <= 20) return <BatteryLow className="text-red-500" />;
    if (batteryLevel <= 50) return <BatteryMedium className="text-yellow-500" />;
    return <BatteryFull className="text-green-500" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {batterySupported && batteryLevel !== null && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                {getBatteryIcon()}
                <span>{Math.round(batteryLevel)}%</span>
                {isCharging && <span className="text-green-500">⚡</span>}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-2 p-1">
                <p className="text-sm font-medium">
                  {isCharging ? "En charge" : "Sur batterie"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Mode économie d'énergie</span>
                  <Switch 
                    checked={powerSavingMode}
                    onCheckedChange={togglePowerSavingMode}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Activer automatiquement</span>
                  <Switch 
                    checked={autoEnablePowerSaving}
                    onCheckedChange={toggleAutoPowerSaving}
                  />
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <Button
        size="icon"
        variant={powerSavingMode ? "default" : "ghost"}
        className={`h-8 w-8 ${powerSavingMode ? "bg-blue-600" : ""}`}
        onClick={togglePowerSavingMode}
      >
        <Moon size={16} />
      </Button>
    </div>
  );
};
