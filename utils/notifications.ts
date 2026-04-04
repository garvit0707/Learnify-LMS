import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const LAST_OPEN_KEY = "learnify_last_open";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return finalStatus === "granted";
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎯 Learning Milestone!",
      body: "You've bookmarked 5 courses! You're on fire. Keep exploring!",
      data: { type: "bookmark_milestone" },
    },
    trigger: null, // immediate
  });
}

export async function scheduleReminderNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 Time to Learn!",
      body: "You haven't opened Learnify in a while. Your courses are waiting!",
      data: { type: "reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 86400, // 24 hours
      repeats: false,
    },
  });
}

export async function recordAppOpen(): Promise<void> {
  await AsyncStorage.setItem(LAST_OPEN_KEY, Date.now().toString());
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
