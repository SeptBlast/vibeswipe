import { db } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { Comment, EmotionType, Post } from "@/types/feed";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, TextInput, View } from "react-native";
import {
  Avatar,
  Button,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import GlassCard from "./ui/GlassCard";

const EMOTIONS: {
  [key in EmotionType]: { icon: string; label: string; color: string };
} = {
  love: { icon: "heart", label: "Love", color: "#FF6B9D" },
  celebrate: { icon: "party-popper", label: "Celebrate", color: "#FFD700" },
  support: { icon: "hands-pray", label: "Support", color: "#4CAF50" },
  insightful: { icon: "lightbulb-on", label: "Insightful", color: "#FF9800" },
  curious: { icon: "help-circle", label: "Curious", color: "#2196F3" },
};

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment?: (comment: string) => void;
  onReact?: (emotion: EmotionType) => void;
  onFetchComments?: () => void;
  currentUserId?: string;
  comments?: Comment[];
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onReact,
  onFetchComments,
  currentUserId,
  comments = [],
}: PostCardProps) {
  const theme = useTheme();
  const isLiked = currentUserId && post.likedBy?.includes(currentUserId);
  const likeScale = React.useRef(new Animated.Value(1)).current;
  const cardScale = React.useRef(new Animated.Value(1)).current;
  const emotionScale = React.useRef(new Animated.Value(0)).current;
  const emotionOpacity = React.useRef(new Animated.Value(0)).current;
  const [showEmotions, setShowEmotions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userAlias, setUserAlias] = useState<string>("Vibe User");

  // Fetch user's anonymousAlias
  useEffect(() => {
    const fetchUserAlias = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", post.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserAlias(userData?.anonymousAlias || "Vibe User");
        }
      } catch (error) {
        console.error("Error fetching user alias:", error);
      }
    };
    fetchUserAlias();
  }, [post.userId]);

  // Find user's active emotion reaction
  const userEmotion = currentUserId
    ? (Object.keys(EMOTIONS) as EmotionType[]).find((emotion) =>
        post.emotionReactions?.[emotion]?.includes(currentUserId),
      )
    : undefined;

  // Fetch comments when comments section is opened
  useEffect(() => {
    if (showComments && onFetchComments) {
      onFetchComments();
    }
  }, [showComments]);

  // Animate emotion picker
  useEffect(() => {
    if (showEmotions) {
      Animated.parallel([
        Animated.spring(emotionScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 200,
        }),
        Animated.timing(emotionOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(emotionScale, {
          toValue: 0,
          useNativeDriver: true,
          damping: 12,
          stiffness: 200,
        }),
        Animated.timing(emotionOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showEmotions]);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
        damping: 10,
        stiffness: 400,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 400,
      }),
    ]).start();
    onLike();
  };

  const handleSubmitComment = () => {
    if (commentText.trim() && onComment) {
      onComment(commentText.trim());
      setCommentText("");
    }
  };

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: liquidGlass.motion.spring.press.scale,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {}}
      >
        <GlassCard intensity="medium">
          {/* Header */}
          <View style={styles.header}>
            {post.isAnonymous ? (
              <Avatar.Icon
                icon="incognito"
                size={44}
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.tertiaryContainer },
                ]}
              />
            ) : (
              <Avatar.Text
                label={userAlias.substring(0, 2).toUpperCase()}
                size={44}
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              />
            )}
            <View style={styles.headerText}>
              <Text
                variant="titleMedium"
                style={[styles.displayName, { color: theme.colors.onSurface }]}
              >
                {post.isAnonymous ? "Anonymous Soul" : userAlias}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {post.createdAt
                  ? formatDistanceToNow(post.createdAt, { addSuffix: true })
                  : "Just now"}
              </Text>
            </View>
          </View>

          {/* Mood Badge */}
          {post.mood && (
            <View style={styles.moodContainer}>
              <Chip
                icon="emoticon-outline"
                style={[
                  styles.moodChip,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={{
                  color: theme.colors.onSecondaryContainer,
                  fontSize: 12,
                }}
              >
                {post.mood}
              </Chip>
            </View>
          )}

          {/* Content */}
          <Text
            variant="bodyLarge"
            style={[styles.content, { color: theme.colors.onSurface }]}
          >
            {post.content}
          </Text>

          {/* Media */}
          {post.mediaUrl && (
            <View style={styles.mediaContainer}>
              {post.mediaType === "image" ? (
                <Image
                  source={{ uri: post.mediaUrl }}
                  style={styles.mediaImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : post.mediaType === "video" ? (
                <View style={styles.videoContainer}>
                  <Image
                    source={{ uri: post.mediaUrl }}
                    style={styles.mediaImage}
                    contentFit="cover"
                  />
                  <View style={styles.videoOverlay}>
                    <IconButton
                      icon="play-circle"
                      size={48}
                      iconColor="rgba(255, 255, 255, 0.9)"
                    />
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.reactionContainer}>
              <Pressable
                onPress={() => setShowEmotions(!showEmotions)}
                onLongPress={() => setShowEmotions(true)}
                style={styles.actionButton}
              >
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <IconButton
                    icon={
                      userEmotion
                        ? EMOTIONS[userEmotion].icon
                        : isLiked
                          ? "heart"
                          : "heart-outline"
                    }
                    size={22}
                    iconColor={
                      userEmotion
                        ? EMOTIONS[userEmotion].color
                        : isLiked
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant
                    }
                  />
                </Animated.View>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {post.reactions || 0}
                </Text>
              </Pressable>

              {/* Floating Emotion Bubble Picker */}
              {showEmotions && (
                <Animated.View
                  style={[
                    styles.floatingEmotionBubble,
                    {
                      transform: [{ scale: emotionScale }],
                      opacity: emotionOpacity,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.emotionBubbleContent,
                      {
                        backgroundColor: theme.dark
                          ? "rgba(30, 35, 45, 0.95)"
                          : "rgba(255, 255, 255, 0.95)",
                        shadowColor: "#000",
                      },
                    ]}
                  >
                    {(Object.keys(EMOTIONS) as EmotionType[]).map(
                      (emotion, index) => {
                        const hasReacted =
                          currentUserId &&
                          post.emotionReactions?.[emotion]?.includes(
                            currentUserId,
                          );
                        const count =
                          post.emotionReactions?.[emotion]?.length || 0;

                        return (
                          <Pressable
                            key={emotion}
                            onPress={() => {
                              handleLike();
                              onReact?.(emotion);
                              setShowEmotions(false);
                            }}
                            style={[
                              styles.floatingEmotionButton,
                              hasReacted && {
                                backgroundColor: theme.colors.primaryContainer,
                                transform: [{ scale: 1.1 }],
                              },
                            ]}
                          >
                            <IconButton
                              icon={EMOTIONS[emotion].icon}
                              size={28}
                              iconColor={EMOTIONS[emotion].color}
                              style={{ margin: 0 }}
                            />
                            {count > 0 && (
                              <View
                                style={[
                                  styles.emotionCountBadge,
                                  { backgroundColor: EMOTIONS[emotion].color },
                                ]}
                              >
                                <Text
                                  variant="labelSmall"
                                  style={{
                                    color: "#FFF",
                                    fontWeight: "700",
                                    fontSize: 10,
                                  }}
                                >
                                  {count}
                                </Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                </Animated.View>
              )}
            </View>

            <Pressable
              onPress={() => setShowComments(!showComments)}
              style={styles.actionButton}
            >
              <IconButton
                icon="comment-outline"
                size={22}
                iconColor={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {post.commentCount || 0}
              </Text>
            </Pressable>
          </View>

          {/* Comments Section */}
          {showComments && (
            <View style={styles.commentsSection}>
              {/* Recent Comments */}
              {comments.length > 0 && (
                <View style={styles.commentsList}>
                  {comments.slice(0, 3).map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Avatar.Text
                        label={comment.anonymousAlias
                          .substring(0, 2)
                          .toUpperCase()}
                        size={32}
                        style={[
                          styles.commentAvatar,
                          { backgroundColor: theme.colors.tertiaryContainer },
                        ]}
                      />
                      <View style={styles.commentContent}>
                        <Text
                          variant="labelMedium"
                          style={{
                            color: theme.colors.onSurface,
                            fontWeight: "600",
                          }}
                        >
                          {comment.anonymousAlias}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurface }}
                        >
                          {comment.text}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            marginTop: 2,
                          }}
                        >
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                          })}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {comments.length > 3 && (
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.primary, marginTop: 8 }}
                    >
                      View all {comments.length} comments
                    </Text>
                  )}
                </View>
              )}

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.onSurface,
                    },
                  ]}
                  placeholder="Write a comment..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <Button
                  mode="contained"
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim()}
                  style={styles.submitButton}
                >
                  Send
                </Button>
              </View>
            </View>
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: liquidGlass.spacing.cozy,
    marginVertical: liquidGlass.spacing.intimate,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: liquidGlass.spacing.cozy,
  },
  avatar: {
    marginRight: liquidGlass.spacing.intimate,
  },
  headerText: {
    flex: 1,
  },
  displayName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  moodContainer: {
    marginBottom: liquidGlass.spacing.intimate,
  },
  moodChip: {
    alignSelf: "flex-start",
    height: 28,
  },
  content: {
    lineHeight: 26,
    marginBottom: liquidGlass.spacing.cozy,
    fontSize: 16,
  },
  mediaContainer: {
    marginTop: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.medium,
    overflow: "hidden",
    marginBottom: liquidGlass.spacing.cozy,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: liquidGlass.spacing.intimate,
    gap: liquidGlass.spacing.cozy,
  },
  reactionContainer: {
    position: "relative",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  floatingEmotionBubble: {
    position: "absolute",
    bottom: 50,
    left: -8,
    zIndex: 1000,
  },
  emotionBubbleContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: liquidGlass.spacing.tight,
    paddingVertical: liquidGlass.spacing.tight,
    borderRadius: liquidGlass.corners.glass,
    gap: liquidGlass.spacing.hairline,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  floatingEmotionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  emotionCountBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  commentsSection: {
    marginTop: liquidGlass.spacing.cozy,
    paddingTop: liquidGlass.spacing.cozy,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  commentsList: {
    marginBottom: liquidGlass.spacing.cozy,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: liquidGlass.spacing.intimate,
  },
  commentAvatar: {
    marginRight: liquidGlass.spacing.intimate,
  },
  commentContent: {
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: liquidGlass.spacing.intimate,
  },
  commentInput: {
    flex: 1,
    borderRadius: liquidGlass.corners.medium,
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingVertical: liquidGlass.spacing.intimate,
    fontSize: 14,
    maxHeight: 100,
  },
  submitButton: {
    marginBottom: 2,
  },
  mediaImage: {
    width: "100%",
    height: 250,
    borderRadius: liquidGlass.corners.medium,
  },
  videoContainer: {
    position: "relative",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
