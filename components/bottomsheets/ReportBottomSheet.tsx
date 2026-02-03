import { ReportReason } from "@/types/moderation";
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
import { Divider, IconButton, Text, useTheme } from "react-native-paper";

interface ReportBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  contentType?: "post" | "comment" | "user";
}

const REPORT_REASONS_WITH_ICONS: Array<{
  value: ReportReason;
  label: string;
  icon: string;
  description?: string;
}> = [
  {
    value: "harassment",
    label: "Harassment or Bullying",
    icon: "alert-octagon",
    description: "Repeated or targeted harassment",
  },
  {
    value: "hate_speech",
    label: "Hate Speech",
    icon: "cancel",
    description: "Slurs, racist, or hateful content",
  },
  {
    value: "violence",
    label: "Violence or Threats",
    icon: "shield-alert",
    description: "Threats or violent content",
  },
  {
    value: "self_harm",
    label: "Self-Harm or Suicide",
    icon: "heart-broken",
    description: "Concerning behavior or content",
  },
  {
    value: "spam",
    label: "Spam or Scam",
    icon: "block-helper",
    description: "Repetitive, misleading, or commercial",
  },
  {
    value: "misinformation",
    label: "False Information",
    icon: "information-off",
    description: "Intentionally misleading content",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate Content",
    icon: "eye-off",
    description: "Inappropriate or explicit content",
  },
  {
    value: "copyright",
    label: "Copyright Violation",
    icon: "copyright",
    description: "Unauthorized use of copyrighted material",
  },
  {
    value: "other",
    label: "Something Else",
    icon: "dots-horizontal",
    description: "Other concerns",
  },
];

export default function ReportBottomSheet({
  visible,
  onDismiss,
  onSubmit,
  contentType = "post",
}: ReportBottomSheetProps) {
  const theme = useTheme();
  const [step, setStep] = useState<"reason" | "submitted">("reason");
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );

  const handleReasonSelect = (reason: ReportReason) => {
    setSelectedReason(reason);
    // Submit immediately after selection
    onSubmit(reason, "");
    setStep("submitted");

    // Auto dismiss after showing confirmation
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep("reason");
    setSelectedReason(null);
    onDismiss();
  };

  const renderReasonStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Report {contentType === "user" ? "User" : "Post"}
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={handleClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
      </View>

      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Why are you reporting this {contentType}?
      </Text>

      <Divider style={styles.divider} />

      <ScrollView
        style={styles.reasonsList}
        showsVerticalScrollIndicator={false}
      >
        {REPORT_REASONS_WITH_ICONS.map((reason, index) => (
          <React.Fragment key={reason.value}>
            <TouchableOpacity
              style={styles.reasonItem}
              onPress={() => handleReasonSelect(reason.value)}
              activeOpacity={0.7}
            >
              <View style={styles.reasonIconContainer}>
                <IconButton
                  icon={reason.icon}
                  size={20}
                  iconColor={
                    reason.value === "harassment" ||
                    reason.value === "hate_speech" ||
                    reason.value === "violence"
                      ? theme.colors.error
                      : theme.colors.onSurfaceVariant
                  }
                  style={{ margin: 0 }}
                />
              </View>
              <View style={styles.reasonTextContainer}>
                <Text
                  style={[
                    styles.reasonLabel,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {reason.label}
                </Text>
                {reason.description && (
                  <Text
                    style={[
                      styles.reasonDescription,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {reason.description}
                  </Text>
                )}
              </View>
              <IconButton
                icon="chevron-right"
                size={18}
                iconColor={theme.colors.onSurfaceVariant}
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            {index < REPORT_REASONS_WITH_ICONS.length - 1 && (
              <Divider style={styles.itemDivider} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text
          variant="bodySmall"
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          Your report is anonymous. We'll review this within 24 hours.
        </Text>
      </View>
    </View>
  );

  const renderSubmittedStep = () => (
    <View style={styles.submittedContent}>
      <View style={styles.submittedIconContainer}>
        <IconButton
          icon="check-circle"
          size={48}
          iconColor={theme.colors.primary}
        />
      </View>
      <Text style={[styles.submittedTitle, { color: theme.colors.onSurface }]}>
        Thanks for reporting
      </Text>
      <Text
        style={[styles.submittedText, { color: theme.colors.onSurfaceVariant }]}
      >
        We appreciate your help keeping VibeSwipe safe and welcoming.
      </Text>
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
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
          {step === "reason" ? renderReasonStep() : renderSubmittedStep()}
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
          {step === "reason" ? renderReasonStep() : renderSubmittedStep()}
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
    maxHeight: "75%",
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
    flex: 1,
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
  reasonsList: {
    maxHeight: 400,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 10 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === "ios" ? 52 : 56,
  },
  reasonIconContainer: {
    marginRight: 12,
    width: 32,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonLabel: {
    fontWeight: "500",
    marginBottom: 2,
    fontSize: Platform.OS === "ios" ? 15 : 16,
  },
  reasonDescription: {
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
  submittedContent: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  submittedIconContainer: {
    marginBottom: 12,
  },
  submittedTitle: {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    fontSize: Platform.OS === "ios" ? 18 : 20,
  },
  submittedText: {
    textAlign: "center",
    lineHeight: 20,
    fontSize: 14,
  },
});
