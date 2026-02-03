export interface Message {
  _id: string;
  text: string;
  createdAt: number | Date; // Using Date or timestamp
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  video?: string;
  system?: boolean;
}

export type ChatRetentionPeriod = "24h" | "1week" | "1month" | "forever";

export interface Chat {
  id: string;
  participants: string[]; // array of uids
  lastMessage?: {
    text: string;
    createdAt: number;
    userId: string;
  };
  unreadCount?: Record<string, number>; // uid -> count
  createdAt: number;
  updatedAt: number;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  messageRetention?: ChatRetentionPeriod; // How long to keep messages
}
