import { db } from "@/configs/firebaseConfig";
import {
  NotificationPreferences,
  cancelAllNotifications,
  defaultNotificationPreferences,
  registerForPushNotificationsAsync,
  scheduleJournalReminder,
} from "@/utils/notifications";
import * as Notifications from "expo-notifications";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
  preferences: defaultNotificationPreferences,
  updatePreferences: async () => {},
  isLoading: true,
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [isLoading, setIsLoading] = useState(true);

  const notificationListener = React.useRef<
    Notifications.Subscription | undefined
  >(undefined);
  const responseListener = React.useRef<Notifications.Subscription | undefined>(
    undefined,
  );

  // Load preferences from Firestore
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  // Setup notification listeners
  useEffect(() => {
    if (!user) return;

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Save token to Firestore
        savePushToken(token);
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        // Handle navigation based on notification type
        if (data.type === "message") {
          // Navigate to chat - you can use router here if needed
          console.log("Navigate to message:", data);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  // Apply preferences when they change
  useEffect(() => {
    if (user) {
      applyPreferences();
    }
  }, [preferences, user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.notificationPreferences) {
          setPreferences(userData.notificationPreferences);
        }
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePushToken = async (token: string) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { expoPushToken: token },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { notificationPreferences: newPreferences },
        { merge: true },
      );
    } catch (error) {
      console.error("Error updating notification preferences:", error);
    }
  };

  const applyPreferences = async () => {
    if (!preferences.enabled) {
      // Cancel all notifications if disabled
      await cancelAllNotifications();
      return;
    }

    // Schedule journal reminders if enabled
    if (preferences.journalReminders) {
      await scheduleJournalReminder(20, 0); // 8 PM daily
    } else {
      await cancelAllNotifications();
    }
  };

  const value = {
    expoPushToken,
    notification,
    preferences,
    updatePreferences,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
