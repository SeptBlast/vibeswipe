export type MoodType = "happy" | "neutral" | "sad" | "excited" | "stressed";

export interface JournalEntry {
  id: string;
  userId: string;
  mood: MoodType;
  note: string;
  audioUrl?: string; // Optional audio recording URL
  audioDuration?: number; // Duration in seconds
  createdAt: number; // Timestamp
  dateString: string; // YYYY-MM-DD for calendar
  isAnonymous: boolean;
  pinned?: boolean; // Optional pinned status
}

export const MOODS: {
  [key in MoodType]: { label: string; icon: string; color: string };
} = {
  happy: { label: "Happy", icon: "emoticon-happy-outline", color: "#FFD700" }, // Gold
  excited: {
    label: "Excited",
    icon: "emoticon-excited-outline",
    color: "#FF8C00",
  }, // Dark Orange
  neutral: {
    label: "Neutral",
    icon: "emoticon-neutral-outline",
    color: "#A9A9A9",
  }, // Dark Gray
  sad: { label: "Sad", icon: "emoticon-sad-outline", color: "#4682B4" }, // Steel Blue
  stressed: {
    label: "Stressed",
    icon: "emoticon-dead-outline",
    color: "#DC143C",
  }, // Crimson
};
