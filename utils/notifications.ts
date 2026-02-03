import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  messages: boolean;
  journalReminders: boolean;
  streakWarnings: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  messages: true,
  journalReminders: true,
  streakWarnings: true,
};

/**
 * Request notification permissions from the user
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  // Skip push token registration on Android in Expo Go (SDK 53+)
  // Remote notifications are not supported, but local notifications still work
  const isExpoGo = Constants.appOwnership === "expo";
  if (Platform.OS === "android" && isExpoGo) {
    console.log(
      "Push notifications not supported in Expo Go on Android. Using local notifications only.",
    );
    // Still request permissions for local notifications
    await Notifications.requestPermissionsAsync();
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log("Project ID not found");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Push token:", token);
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  return token;
}

/**
 * Schedule a local notification for journal reminder
 */
export async function scheduleJournalReminder(
  hour: number = 20,
  minute: number = 0,
) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (Platform.OS === "android") {
    // Android doesn't support CALENDAR trigger, use DAILY instead
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour, minute, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to reflect 🌙",
        body: "How are you feeling today? Take a moment to journal your thoughts.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
      },
    });
  } else {
    // iOS supports CALENDAR trigger
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to reflect 🌙",
        body: "How are you feeling today? Take a moment to journal your thoughts.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  }
}

/**
 * Schedule a notification for streak warning (24 hours since last journal)
 */
export async function scheduleStreakWarning(lastJournalDate: Date) {
  const twentyFourHoursLater = new Date(lastJournalDate);
  twentyFourHoursLater.setHours(twentyFourHoursLater.getHours() + 24);

  const now = new Date();
  if (twentyFourHoursLater <= now) {
    // Already past 24 hours, send immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't break your streak! 🔥",
        body: "You haven't journaled today. Keep your momentum going!",
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } else {
    // Schedule for 24 hours after last journal
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't break your streak! 🔥",
        body: "You haven't journaled today. Keep your momentum going!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: twentyFourHoursLater,
      },
    });
  }
}

/**
 * Send a notification when a new message is received
 */
export async function sendMessageNotification(
  senderName: string,
  messageText: string,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New message from ${senderName}`,
      body: messageText,
      sound: true,
      data: { type: "message", sender: senderName },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
