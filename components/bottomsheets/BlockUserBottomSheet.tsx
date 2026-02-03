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
  Button,
  Divider,
  IconButton,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

interface BlockUserBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
}

const BLOCK_REASONS = [
  {
    value: "harassment",
    label: "They're harassing me",
    icon: "alert-octagon",
  },
  {
    value: "inappropriate",
    label: "Posting inappropriate things",
    icon: "eye-off",
  },
  {
    value: "spam",
    label: "It's spam or a scam",
    icon: "block-helper",
  },
  {
    value: "impersonation",
    label: "Pretending to be someone else",
    icon: "account-alert",
  },
  {
    value: "uncomfortable",
    label: "Just don't want to see their content",
    icon: "cancel",
  },
];

export default function BlockUserBottomSheet({
  visible,
  onDismiss,
  onConfirm,
  userName,
}: BlockUserBottomSheetProps) {
  const theme = useTheme();
  const [step, setStep] = useState<"confirm" | "reason" | "blocked">("confirm");
  const [selectedReason, setSelectedReason] = useState<string>("uncomfortable");

  const handleClose = () => {
    setStep("confirm");
    setSelectedReason("uncomfortable");
    onDismiss();
  };

  const handleBlockConfirm = () => {
    onConfirm(selectedReason);
    setStep("blocked");

    // Auto dismiss after showing confirmation
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const renderConfirmStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Block {userName}?
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={handleClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <IconButton icon="cancel" size={44} iconColor={theme.colors.error} />
        </View>

        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          They won't be able to:
        </Text>

        <View style={styles.featureList}>
          {[
            { icon: "account-off", text: "Find your profile or posts" },
            { icon: "comment-off", text: "Send you messages" },
            { icon: "eye-off", text: "See your content in their feed" },
            { icon: "bell-off", text: "Get notified about you" },
          ].map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <IconButton
                icon={item.icon}
                size={18}
                iconColor={theme.colors.onSurfaceVariant}
                style={styles.featureIcon}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.noticeBox}>
          <IconButton
            icon="information"
            size={18}
            iconColor={theme.colors.primary}
            style={{ margin: 0, marginRight: 6 }}
          />
          <Text
            style={[
              styles.noticeText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {userName} won't be notified that you blocked them
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleClose}
          style={[styles.button, styles.cancelButton]}
          labelStyle={{ color: theme.colors.onSurface }}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={() => setStep("reason")}
          style={[styles.button, styles.blockButton]}
          buttonColor={theme.colors.error}
        >
          Block
        </Button>
      </View>
    </View>
  );

  const renderReasonStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={() => setStep("confirm")}
          iconColor={theme.colors.onSurfaceVariant}
          style={{ margin: 0 }}
        />
        <Text
          style={[styles.title, { color: theme.colors.onSurface, flex: 1 }]}
        >
          Why are you blocking?
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
        This helps us understand what's happening
      </Text>

      <Divider style={styles.divider} />

      <ScrollView
        style={styles.reasonsList}
        showsVerticalScrollIndicator={false}
      >
        <RadioButton.Group
          onValueChange={(value) => setSelectedReason(value)}
          value={selectedReason}
        >
          {BLOCK_REASONS.map((reason, index) => (
            <React.Fragment key={reason.value}>
              <TouchableOpacity
                style={styles.reasonItem}
                onPress={() => setSelectedReason(reason.value)}
                activeOpacity={0.7}
              >
                <View style={styles.reasonContent}>
                  <IconButton
                    icon={reason.icon}
                    size={20}
                    iconColor={theme.colors.onSurfaceVariant}
                    style={styles.reasonIcon}
                  />
                  <Text
                    style={[
                      styles.reasonLabel,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {reason.label}
                  </Text>
                </View>
                <RadioButton value={reason.value} />
              </TouchableOpacity>
              {index < BLOCK_REASONS.length - 1 && (
                <Divider style={styles.itemDivider} />
              )}
            </React.Fragment>
          ))}
        </RadioButton.Group>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleBlockConfirm}
          style={[styles.button, styles.fullWidthButton]}
          buttonColor={theme.colors.error}
        >
          Block {userName}
        </Button>
      </View>
    </View>
  );

  const renderBlockedStep = () => (
    <View style={styles.submittedContent}>
      <View style={styles.submittedIconContainer}>
        <IconButton
          icon="check-circle"
          size={64}
          iconColor={theme.colors.primary}
        />
      </View>
      <Text
        variant="headlineSmall"
        style={[styles.submittedTitle, { color: theme.colors.onSurface }]}
      >
        {userName} is blocked
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.submittedText, { color: theme.colors.onSurfaceVariant }]}
      >
        You won't see their posts anymore. You can unblock them anytime from
        your settings.
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
          {step === "confirm"
            ? renderConfirmStep()
            : step === "reason"
              ? renderReasonStep()
              : renderBlockedStep()}
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
          {step === "confirm"
            ? renderConfirmStep()
            : step === "reason"
              ? renderReasonStep()
              : renderBlockedStep()}
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
    maxHeight: "80%",
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
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
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
  scrollContent: {
    paddingHorizontal: 16,
    maxHeight: 350,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  description: {
    marginBottom: 12,
    fontWeight: "600",
    fontSize: 14,
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIcon: {
    margin: 0,
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(120, 120, 128, 0.08)",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  blockButton: {},
  fullWidthButton: {
    flex: 1,
  },
  divider: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 10 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === "ios" ? 48 : 52,
  },
  reasonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reasonIcon: {
    margin: 0,
    marginRight: 12,
  },
  reasonLabel: {
    fontWeight: "500",
    flex: 1,
    fontSize: Platform.OS === "ios" ? 15 : 16,
  },
  itemDivider: {
    marginLeft: 60,
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
