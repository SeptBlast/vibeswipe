export interface UserProfile {
    uid: string;
    email?: string;
    photoURL?: string;
    isAnonymousProfile: boolean;
    anonymousAlias?: string; // e.g. "Quiet Owl" - this is the user's display name
    showAlias?: boolean; // Toggle to show alias instead of real name
    moodHistory?: number[]; // Enum values stored as numbers
    averageMood?: number;
    lastActive?: number;
    themePreference?: 'system' | 'light' | 'dark';
}
