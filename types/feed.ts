export type PostType = "text" | "image" | "video";

export type EmotionType =
  | "love"
  | "celebrate"
  | "support"
  | "insightful"
  | "curious";

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Post {
  id: string;
  userId: string; // 'anonymous' or real uid
  content: string; // text content or caption
  mediaUrl?: string; // for image/video
  mediaType: PostType;
  mood?: string; // Optional mood context
  reactions: number; // For simplicity
  likedBy?: string[]; // Array of user IDs who liked the post
  emotionReactions?: { [key in EmotionType]?: string[] }; // user IDs who reacted with each emotion
  commentCount: number;
  createdAt: number;
  isAnonymous: boolean;
}

export interface Comment {
  id: string;
  // postId is not needed - comments are stored in subcollection posts/{postId}/comments
  userId: string;
  anonymousAlias: string;
  text: string;
  createdAt: number;
}
