import { MOODS, MoodType } from '@/types/journal';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

interface MoodSelectorProps {
    selectedMood: MoodType | null;
    onSelect: (mood: MoodType) => void;
}

export default function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {Object.entries(MOODS).map(([key, value]) => {
                const isSelected = selectedMood === key;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onSelect(key as MoodType)}
                        style={[
                            styles.moodItem,
                            isSelected && { backgroundColor: theme.colors.secondaryContainer },
                        ]}
                    >
                        <IconButton
                            icon={value.icon}
                            iconColor={isSelected ? value.color : theme.colors.onSurfaceVariant}
                            size={32}
                            style={{ margin: 0 }}
                        />
                        <Text
                            variant="labelSmall"
                            style={{ color: isSelected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant }}
                        >
                            {value.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    moodItem: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
    },
});
