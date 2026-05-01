import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Heart,
  MessageCircle,
  Search,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  PenSquare,
  X,
} from "lucide-react-native";
import {
  getCommunityPosts,
  createCommunityPost,
  toggleCommunityLike,
  addCommunityComment,
} from "../../services/api";
import styles from "./styles/CommunityScreenStyles";
import BottomNavBar from "../../components/BottomNavBar";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Comment = {
  id: number;
  content: string;
  createdAt?: string;
};

type CommunityPost = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  createdAt?: string;
  comments?: Comment[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ANON_AVATARS = ["🌿", "🌊", "🔮", "🌙", "⭐", "🍃", "🌸", "🦋", "🌺", "🍀"];
const getAvatar = (id: number) => ANON_AVATARS[id % ANON_AVATARS.length];

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CommunityScreen({ navigation }: any) {
  const [loading, setLoading]                   = useState(true);
  const [posting, setPosting]                   = useState(false);
  const [search, setSearch]                     = useState("");
  const [posts, setPosts]                       = useState<CommunityPost[]>([]);
  const [title, setTitle]                       = useState("");
  const [content, setContent]                   = useState("");
  const [commentDrafts, setCommentDrafts]       = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [showCompose, setShowCompose]           = useState(false);
  const [sendingComment, setSendingComment]     = useState<number | null>(null);

  const loadPosts = async (searchValue = search) => {
    try {
      const response = await getCommunityPosts(searchValue.trim());
      setPosts(Array.isArray(response) ? response : []);
    } catch {
      Alert.alert("Error", "Could not load community posts.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPosts();
    }, []),
  );

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing fields", "Please enter both title and content.");
      return;
    }
    setPosting(true);
    try {
      await createCommunityPost({ title: title.trim(), content: content.trim(), tags: [] });
      setTitle("");
      setContent("");
      setShowCompose(false);
      await loadPosts();
    } catch (error: any) {
      Alert.alert("Post failed", error?.response?.data?.error || "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    const snapshot = posts;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: !p.isLikedByMe,
              likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p,
      ),
    );
    try {
      await toggleCommunityLike(postId);
    } catch {
      setPosts(snapshot);
    }
  };

  const handleComment = async (postId: number) => {
    const comment = (commentDrafts[postId] || "").trim();
    if (!comment) return;
    setSendingComment(postId);
    try {
      await addCommunityComment(postId, comment);
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      await loadPosts();
    } catch (error: any) {
      Alert.alert("Comment failed", error?.response?.data?.error || "Could not add comment.");
    } finally {
      setSendingComment(null);
    }
  };

  const toggleComments = (postId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // ── Post card ───────────────────────────────────────────────────────────────

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const isExpanded = expandedComments[item.id];
    const avatar     = getAvatar(item.id);

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{avatar}</Text>
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.anonLabel}>Anonymous</Text>
            <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>

        {/* Body */}
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action bar */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => handleLike(item.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Heart
              size={17}
              color={item.isLikedByMe ? "#EF4444" : "#94A3B8"}
              fill={item.isLikedByMe ? "#EF4444" : "none"}
            />
            <Text style={[styles.actionText, item.isLikedByMe && styles.actionTextLiked]}>
              {item.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleComments(item.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <MessageCircle size={17} color="#94A3B8" />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
            {isExpanded
              ? <ChevronUp size={13} color="#94A3B8" />
              : <ChevronDown size={13} color="#94A3B8" />
            }
          </TouchableOpacity>
        </View>

        {/* Expandable comments */}
        {isExpanded && (
          <View style={styles.commentsSection}>
            <View style={styles.commentsDivider} />

            {item.comments && item.comments.length > 0 ? (
              item.comments.map((c, i) => (
                <View key={c.id ?? i} style={styles.commentBubble}>
                  <Text style={styles.commentAnonLabel}>
                    {getAvatar(c.id ?? i)} Anonymous
                  </Text>
                  <Text style={styles.commentText}>{c.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCommentsText}>
                No comments yet. Start the conversation!
              </Text>
            )}

            {/* Comment input */}
            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Write a comment..."
                placeholderTextColor="#94A3B8"
                value={commentDrafts[item.id] || ""}
                onChangeText={(val) =>
                  setCommentDrafts((prev) => ({ ...prev, [item.id]: val }))
                }
                style={styles.commentInput}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  sendingComment === item.id && styles.sendButtonDisabled,
                ]}
                onPress={() => handleComment(item.id)}
                disabled={sendingComment === item.id}
                activeOpacity={0.8}
              >
                {sendingComment === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={15} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSub}>Anonymous health discussions</Text>
          </View>
          <TouchableOpacity
            onPress={() => loadPosts()}
            style={styles.refreshBtn}
            activeOpacity={0.7}
          >
            <RefreshCw size={15} color="#199A8E" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search discussions..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            onSubmitEditing={() => { setLoading(true); loadPosts(search); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); loadPosts(""); }}>
              <X size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Compose card */}
        {showCompose && (
          <View style={styles.composeCard}>
            <View style={styles.composeHeader}>
              <Text style={styles.composeHeading}>New Post</Text>
              <TouchableOpacity onPress={() => setShowCompose(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.anonBadge}>
              <Text style={styles.anonBadgeText}>🌿 Posting as Anonymous</Text>
            </View>

            <TextInput
              placeholder="Give your post a title..."
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              style={styles.composeTitle}
            />
            <TextInput
              placeholder="Share your experience, question, or tip..."
              placeholderTextColor="#94A3B8"
              value={content}
              onChangeText={setContent}
              style={styles.composeContent}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.postButton, posting && styles.postButtonDisabled]}
              disabled={posting}
              onPress={handleCreatePost}
              activeOpacity={0.85}
            >
              <Text style={styles.postButtonText}>
                {posting ? "Posting..." : "Share Anonymously"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feed */}
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#199A8E" />
            <Text style={styles.loadingText}>Loading discussions...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>No discussions yet</Text>
                <Text style={styles.emptySubText}>
                  Be the first to share something with the community.
                </Text>
              </View>
            }
            renderItem={renderPost}
          />
        )}

        {/* FAB */}
        {!showCompose && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowCompose(true)}
            activeOpacity={0.85}
          >
            <PenSquare size={18} color="#fff" />
            <Text style={styles.fabText}>New Post</Text>
          </TouchableOpacity>
        )}

        <BottomNavBar navigation={navigation} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}