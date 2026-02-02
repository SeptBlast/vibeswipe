/**
 * Moderation and Content Safety Types
 *
 * These types support Apple App Store Guideline 1.2 compliance
 * for user-generated content moderation.
 */

export type ReportReason =
  | "harassment"
  | "hate_speech"
  | "spam"
  | "inappropriate_content"
  | "violence"
  | "self_harm"
  | "misinformation"
  | "copyright"
  | "other";

export type ModerationStatus = "pending" | "approved" | "removed" | "dismissed";

export type ContentType = "post" | "comment" | "message" | "profile";

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  contentId: string;
  contentType: ContentType;
  contentOwnerId: string;
  reason: ReportReason;
  description: string;
  status: ModerationStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string; // Admin user ID
  reviewNotes?: string;
  actionTaken?: string;
}

export interface BlockedUser {
  blockedUserId: string;
  blockedAt: number;
  reason?: string;
}

export interface ModerationAction {
  id: string;
  actionType:
    | "content_removed"
    | "user_suspended"
    | "user_banned"
    | "warning_issued";
  targetUserId: string;
  targetContentId?: string;
  performedBy: string; // Admin user ID
  reason: string;
  duration?: number; // For suspensions, duration in milliseconds
  createdAt: number;
  notes?: string;
}

export interface UserModerationStatus {
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedUntil?: number;
  isBanned: boolean;
  bannedReason?: string;
  bannedAt?: number;
  warningCount: number;
  moderationNotes: string[];
  lastModeratedAt?: number;
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Harassment or Bullying",
  hate_speech: "Hate Speech",
  spam: "Spam or Scam",
  inappropriate_content: "Inappropriate Content",
  violence: "Violence or Dangerous Content",
  self_harm: "Self-Harm or Suicide",
  misinformation: "False Information",
  copyright: "Copyright Violation",
  other: "Other Violation",
};

export const REPORT_REASON_DESCRIPTIONS: Record<ReportReason, string> = {
  harassment: "Targeted harassment, bullying, or threats",
  hate_speech: "Content promoting hate against individuals or groups",
  spam: "Unwanted commercial content or deceptive practices",
  inappropriate_content: "Sexual, graphic, or otherwise inappropriate content",
  violence: "Content promoting or depicting violence",
  self_harm: "Content promoting self-harm or suicide",
  misinformation: "Deliberately false or misleading information",
  copyright: "Unauthorized use of copyrighted material",
  other: "Other policy violations",
};
