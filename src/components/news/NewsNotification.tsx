
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NewsNotification = () => {
  const { 
    notificationsSupported, 
    notificationsEnabled, 
    requestPermission 
  } = useNotifications();
  
  // For demo purposes, send a notification when a "new" article arrives
  useEffect(() => {
    const newsCheckInterval = setInterval(() => {
      const shouldNotify = Math.random() > 0.96; // Simulate random news events
      
      if (shouldNotify && notificationsEnabled) {
        const topics = ['politique', 'technologie', 'économie', 'santé', 'international'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        new Notification("Nouvelle actualité", {
          body: `Un nouvel article sur ${randomTopic} est disponible.`,
          icon: "/news-icon.png"
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(newsCheckInterval);
  }, [notificationsEnabled]);
  
  if (!notificationsSupported) {
    return null;
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={requestPermission}
          className="px-2"
        >
          {notificationsEnabled ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {notificationsEnabled 
          ? "Notifications d'actualités activées" 
          : "Activer les notifications d'actualités"}
      </TooltipContent>
    </Tooltip>
  );
};

export default NewsNotification;
