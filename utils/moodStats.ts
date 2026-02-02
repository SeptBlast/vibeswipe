import { MoodType } from '@/types/journal';

export const MOOD_VALUES: { [key in MoodType]: number } = {
    happy: 5,
    excited: 4,
    neutral: 3,
    sad: 2,
    stressed: 1,
};

export const getMoodValue = (mood: MoodType): number => MOOD_VALUES[mood] || 3;

export const calculateAverageMood = (moods: MoodType[]): number => {
    if (moods.length === 0) return 0;
    const sum = moods.reduce((acc, mood) => acc + getMoodValue(mood), 0);
    return sum / moods.length;
};
