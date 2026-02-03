import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import {
  Divider,
  IconButton,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

export type ChatRetentionPeriod = "24h" | "1week" | "1month" | "forever";

interface ChatSettingsBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onReportUser: () => void;
  onBlockUser: () => void;
  currentRetention: ChatRetentionPeriod;
  onRetentionChange: (period: ChatRetentionPeriod) => void;
  userName: string;
  onModalHide?: () => void;
}

const RETENTION_OPTIONS: Array<{
  value: ChatRetentionPeriod;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: "24h",
    label: "24 Hours",
    description: "Messages disappear after 1 day",
    icon: "clock-fast",
  },
  {
    value: "1week",
    label: "1 Week",
    description: "Messages disappear after 7 days",
    icon: "clock-outline",
  },
  {
    value: "1month",
    label: "1 Month",
    description: "Messages disappear after 30 days",
    icon: "calendar-clock",
  },
  {
    value: "forever",
    label: "Keep Forever",
    description: "Messages never disappear",
    icon: "infinity",
  },
];

export default function ChatSettingsBottomSheet({
  visible,
  onDismiss,
  onReportUser,
  onBlockUser,
  currentRetention,
  onRetentionChange,
  userName,
  onModalHide,
}: ChatSettingsBottomSheetProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"settings" | "retention">(
    "settings",
  );

  const handleClose = () => {
    setActiveTab("settings");
    onDismiss();
  };

  const renderSettingsTab = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Chat Settings
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={handleClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Manage your conversation with {userName}
      </Text>

      <Divider style={styles.divider} />

      <ScrollView
        style={styles.optionsList}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => setActiveTab("retention")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <IconButton
              icon="timer-sand"
              size={20}
              iconColor={theme.colors.primary}
              style={{ margin: 0 }}
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text
              style={[styles.optionLabel, { color: theme.colors.onSurface }]}
            >
              Message Timer
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {
                RETENTION_OPTIONS.find((opt) => opt.value === currentRetention)
                  ?.label
              }
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={18}
            iconColor={theme.colors.onSurfaceVariant}
            style={{ margin: 0 }}
          />
        </TouchableOpacity>

        <Divider style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            handleClose();
            onReportUser();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <IconButton
              icon="flag"
              size={20}
              iconColor={theme.colors.error}
              style={{ margin: 0 }}
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text
              style={[styles.optionLabel, { color: theme.colors.onSurface }]}
            >
              Report User
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Report inappropriate behavior
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={18}
            iconColor={theme.colors.onSurfaceVariant}
            style={{ margin: 0 }}
          />
        </TouchableOpacity>

        <Divider style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            handleClose();
            onBlockUser();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <IconButton
              icon="cancel"
              size={20}
              iconColor={theme.colors.error}
              style={{ margin: 0 }}
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionLabel, { color: theme.colors.error }]}>
              Block User
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Stop seeing messages from {userName}
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={18}
            iconColor={theme.colors.onSurfaceVariant}
            style={{ margin: 0 }}
          />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          Changes to message timer apply to future messages only
        </Text>
      </View>
    </View>
  );

  const renderRetentionTab = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={() => setActiveTab("settings")}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
        <Text
          style={[styles.title, { color: theme.colors.onSurface, flex: 1 }]}
        >
          Message Timer
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={handleClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Choose how long messages stay in this chat
      </Text>

      <Divider style={styles.divider} />

      <ScrollView
        style={styles.retentionList}
        showsVerticalScrollIndicator={false}
      >
        <RadioButton.Group
          onValueChange={(value) =>
            onRetentionChange(value as ChatRetentionPeriod)
          }
          value={currentRetention}
        >
          {RETENTION_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <TouchableOpacity
                style={styles.retentionItem}
                onPress={() => onRetentionChange(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.retentionContent}>
                  <IconButton
                    icon={option.icon}
                    size={20}
                    iconColor={
                      currentRetention === option.value
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.retentionIcon}
                  />
                  <View style={styles.retentionTextContainer}>
                    <Text
                      style={[
                        styles.retentionLabel,
                        {
                          color:
                            currentRetention === option.value
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.retentionDescription,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>
                <RadioButton value={option.value} />
              </TouchableOpacity>
              {index < RETENTION_OPTIONS.length - 1 && (
                <Divider style={styles.itemDivider} />
              )}
            </React.Fragment>
          ))}
        </RadioButton.Group>
      </ScrollView>

      <View style={styles.footer}>
        <Text
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          This setting only affects future messages. Existing messages won't be
          deleted.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      onModalHide={onModalHide}
      swipeDirection={["down"]}
      style={styles.modal}
      propagateSwipe
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={95}
          tint={theme.dark ? "dark" : "light"}
          style={styles.container}
        >
          <View style={styles.handleBar} />
          {activeTab === "settings"
            ? renderSettingsTab()
            : renderRetentionTab()}
        </BlurView>
      ) : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.dark
                ? "rgba(30, 35, 45, 0.98)"
                : "rgba(255, 255, 255, 0.98)",
            },
          ]}
        >
          <View style={styles.handleBar} />
          {activeTab === "settings"
            ? renderSettingsTab()
            : renderRetentionTab()}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    borderTopLeftRadius: Platform.OS === "ios" ? 20 : 16,
    borderTopRightRadius: Platform.OS === "ios" ? 20 : 16,
    maxHeight: "70%",
    overflow: "hidden",
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "700",
    fontSize: Platform.OS === "ios" ? 18 : 20,
  },
  subtitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 20,
    fontSize: 14,
  },
  divider: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  optionsList: {
    maxHeight: 350,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 10 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === "ios" ? 56 : 60,
  },
  optionIconContainer: {
    marginRight: 12,
    width: 32,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: "500",
    marginBottom: 2,
    fontSize: Platform.OS === "ios" ? 15 : 16,
  },
  optionDescription: {
    lineHeight: 18,
    fontSize: 13,
  },
  itemDivider: {
    marginLeft: 60,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 18,
    fontSize: 12,
  },
  retentionList: {
    maxHeight: 350,
  },
  retentionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 10 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === "ios" ? 60 : 64,
  },
  retentionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  retentionIcon: {
    margin: 0,
    marginRight: 12,
  },
  retentionTextContainer: {
    flex: 1,
  },
  retentionLabel: {
    fontWeight: "500",
    marginBottom: 2,
    fontSize: Platform.OS === "ios" ? 15 : 16,
  },
  retentionDescription: {
    lineHeight: 18,
    fontSize: 13,
  },
});
