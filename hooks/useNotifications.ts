import {
    cancelAllNotifications,
    recordAppOpen,
    requestNotificationPermissions,
    scheduleReminderNotification,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const LAST_OPEN_KEY = "learnify_last_open";

export function useNotifications() {
  useEffect(() => {
    const setup = async () => {
      await requestNotificationPermissions();

      const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);
      if (lastOpen) {
        const diff = Date.now() - parseInt(lastOpen, 10);
        if (diff >= 86400000) {
          await scheduleReminderNotification();
        }
      }

      await cancelAllNotifications(); // Cancel old reminders
      await recordAppOpen();

      // Schedule new reminder for 24h from now
      await scheduleReminderNotification();
    };

    setup();
  }, []);
}
