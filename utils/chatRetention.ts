/**
 * Chat Message Retention Manager
 *
 * Handles automatic deletion of chat messages based on retention settings.
 * This should be run periodically (e.g., via Cloud Functions or scheduled task).
 */

import { db } from "@/configs/firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export type ChatRetentionPeriod = "24h" | "1week" | "1month" | "forever";

const RETENTION_PERIODS: Record<ChatRetentionPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  "1week": 7 * 24 * 60 * 60 * 1000, // 7 days
  "1month": 30 * 24 * 60 * 60 * 1000, // 30 days
  forever: Infinity, // Never delete
};

/**
 * Clean up old messages in a specific chat based on retention settings
 */
export async function cleanupChatMessages(chatId: string): Promise<number> {
  try {
    // Get chat retention setting
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    if (!chatDoc.exists()) {
      return 0;
    }

    const chatData = chatDoc.data();
    const retention: ChatRetentionPeriod =
      chatData.messageRetention || "forever";

    // If forever, no cleanup needed
    if (retention === "forever") {
      return 0;
    }

    const retentionMs = RETENTION_PERIODS[retention];
    const cutoffTime = Date.now() - retentionMs;

    // Get all messages older than cutoff
    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(
      messagesRef,
      where("createdAt", "<", cutoffTime),
    );

    const snapshot = await getDocs(messagesQuery);
    let deletedCount = 0;

    // Delete old messages
    const deletePromises = snapshot.docs.map((messageDoc) => {
      deletedCount++;
      return deleteDoc(messageDoc.ref);
    });

    await Promise.all(deletePromises);

    console.log(
      `Cleaned up ${deletedCount} messages from chat ${chatId} (retention: ${retention})`,
    );
    return deletedCount;
  } catch (error) {
    console.error(`Error cleaning up chat ${chatId}:`, error);
    return 0;
  }
}

/**
 * Clean up old messages across all chats
 * This should be run periodically as a background job
 */
export async function cleanupAllChats(): Promise<{
  processedChats: number;
  deletedMessages: number;
}> {
  try {
    const chatsSnapshot = await getDocs(collection(db, "chats"));
    let processedChats = 0;
    let totalDeleted = 0;

    const cleanupPromises = chatsSnapshot.docs.map(async (chatDoc) => {
      processedChats++;
      const deleted = await cleanupChatMessages(chatDoc.id);
      totalDeleted += deleted;
    });

    await Promise.all(cleanupPromises);

    console.log(
      `Cleanup complete: ${processedChats} chats processed, ${totalDeleted} messages deleted`,
    );

    return {
      processedChats,
      deletedMessages: totalDeleted,
    };
  } catch (error) {
    console.error("Error during chat cleanup:", error);
    return {
      processedChats: 0,
      deletedMessages: 0,
    };
  }
}

/**
 * Get human-readable description of retention period
 */
export function getRetentionDescription(period: ChatRetentionPeriod): string {
  switch (period) {
    case "24h":
      return "Messages disappear after 24 hours";
    case "1week":
      return "Messages disappear after 1 week";
    case "1month":
      return "Messages disappear after 30 days";
    case "forever":
      return "Messages are kept forever";
    default:
      return "Unknown retention period";
  }
}

/**
 * Check if a message should be deleted based on chat retention
 */
export async function shouldDeleteMessage(
  chatId: string,
  messageCreatedAt: number,
): Promise<boolean> {
  try {
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    if (!chatDoc.exists()) {
      return false;
    }

    const chatData = chatDoc.data();
    const retention: ChatRetentionPeriod =
      chatData.messageRetention || "forever";

    if (retention === "forever") {
      return false;
    }

    const retentionMs = RETENTION_PERIODS[retention];
    const cutoffTime = Date.now() - retentionMs;

    return messageCreatedAt < cutoffTime;
  } catch (error) {
    console.error("Error checking message deletion:", error);
    return false;
  }
}
