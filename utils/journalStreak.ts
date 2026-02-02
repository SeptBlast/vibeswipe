import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { scheduleStreakWarning } from "./notifications";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastJournalDate: Date | null;
  totalJournals: number;
}

/**
 * Calculate the current journal streak for a user
 */
export async function calculateJournalStreak(
  userId: string,
): Promise<StreakData> {
  try {
    const journalsRef = collection(db, CollectionNames.JOURNALS);
    const q = query(
      journalsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastJournalDate: null,
        totalJournals: 0,
      };
    }

    const journals = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt,
    }));

    const totalJournals = journals.length;

    // Get dates (reset to start of day for comparison)
    const dates = journals.map((j) => {
      const date = new Date(j.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    // Remove duplicates (multiple journals on same day)
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

    if (uniqueDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastJournalDate: null,
        totalJournals: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    // Calculate current streak
    let currentStreak = 0;
    const mostRecentDate = uniqueDates[0];

    // Only count streak if last journal was today or yesterday
    if (mostRecentDate === todayTime || mostRecentDate === yesterdayTime) {
      currentStreak = 1;
      let expectedDate = mostRecentDate;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(expectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const expectedPrevDate = prevDate.getTime();

        if (uniqueDates[i] === expectedPrevDate) {
          currentStreak++;
          expectedDate = uniqueDates[i];
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const prevDate = new Date(uniqueDates[i - 1]);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedDate = prevDate.getTime();

      if (currentDate === expectedDate) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    const lastJournalDate = new Date(journals[0].createdAt);

    return {
      currentStreak,
      longestStreak,
      lastJournalDate,
      totalJournals,
    };
  } catch (error) {
    console.error("Error calculating journal streak:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastJournalDate: null,
      totalJournals: 0,
    };
  }
}

/**
 * Check if user should receive a streak warning
 */
export async function checkAndScheduleStreakWarning(
  userId: string,
  preferences: any,
) {
  if (!preferences.streakWarnings || !preferences.enabled) {
    return;
  }

  const streakData = await calculateJournalStreak(userId);

  if (!streakData.lastJournalDate) {
    return; // No journals yet
  }

  const now = new Date();
  const hoursSinceLastJournal =
    (now.getTime() - streakData.lastJournalDate.getTime()) / (1000 * 60 * 60);

  // If it's been more than 20 hours since last journal, schedule warning
  if (hoursSinceLastJournal >= 20 && hoursSinceLastJournal < 24) {
    await scheduleStreakWarning(streakData.lastJournalDate);
  }
}
