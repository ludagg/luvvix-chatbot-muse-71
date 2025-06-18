
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ad47350f59af461eb6821f7fd95503bc',
  appName: 'luvvix-chatbot-muse-71',
  webDir: 'dist',
  server: {
    url: "https://ad47350f-59af-461e-b682-1f7fd95503bc.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    }
  }
};

export default config;
