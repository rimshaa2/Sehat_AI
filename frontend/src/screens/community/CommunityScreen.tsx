import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Heart, MessageCircle, Search, RefreshCw } from "lucide-react-native";
import {
  getCommunityPosts,
  createCommunityPost,
  toggleCommunityLike,
  addCommunityComment,
} from "../../services/api";
import styles from "./styles/CommunityScreenStyles";
import BottomNavBar from "../../components/BottomNavBar";

type CommunityPost = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  author: { fullName: string };
};

export default function CommunityScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  const loadPosts = async (searchValue = search) => {
    try {
      const response = await getCommunityPosts(searchValue.trim());
      setPosts(Array.isArray(response) ? response : []);
    } catch (error) {
      Alert.alert("Error", "Could not load community posts.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
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
      await createCommunityPost({
        title: title.trim(),
        content: content.trim(),
        tags: [],
      });
      setTitle("");
      setContent("");
      await loadPosts();
    } catch (error: any) {
      Alert.alert("Post failed", error?.response?.data?.error || "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    const current = posts;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByMe: !post.isLikedByMe,
              likesCount: post.isLikedByMe ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post,
      ),
    );
    try {
      await toggleCommunityLike(postId);
    } catch (error) {
      setPosts(current);
      Alert.alert("Error", "Could not update like.");
    }
  };

  const handleComment = async (postId: number) => {
    const comment = (commentDrafts[postId] || "").trim();
    if (!comment) return;
    try {
      await addCommunityComment(postId, comment);
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      await loadPosts();
    } catch (error: any) {
      Alert.alert(
        "Comment failed",
        error?.response?.data?.error || "Could not add comment.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Discussion</Text>
        <TouchableOpacity onPress={() => loadPosts()} style={styles.refreshBtn}>
          <RefreshCw size={16} color="#199A8E" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Search discussions..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          onSubmitEditing={() => {
            setLoading(true);
            loadPosts(search);
          }}
        />
      </View>

      <View style={styles.composeCard}>
        <TextInput
          placeholder="Post title"
          value={title}
          onChangeText={setTitle}
          style={styles.composeTitle}
        />
        <TextInput
          placeholder="Share your experience or ask a question..."
          value={content}
          onChangeText={setContent}
          style={styles.composeContent}
          multiline
        />
        <TouchableOpacity
          style={styles.postButton}
          disabled={posting}
          onPress={handleCreatePost}
        >
          <Text style={styles.postButtonText}>{posting ? "Posting..." : "Create Post"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#199A8E" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No discussions yet. Be the first to post.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Text style={styles.postAuthor}>{item.author?.fullName || "Anonymous"}</Text>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postContent}>{item.content}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => handleLike(item.id)}
                  style={styles.actionButton}
                >
                  <Heart
                    size={16}
                    color={item.isLikedByMe ? "#EF4444" : "#6B7280"}
                    fill={item.isLikedByMe ? "#EF4444" : "none"}
                  />
                  <Text style={styles.actionText}>{item.likesCount}</Text>
                </TouchableOpacity>
                <View style={styles.actionButton}>
                  <MessageCircle size={16} color="#6B7280" />
                  <Text style={styles.actionText}>{item.commentsCount}</Text>
                </View>
              </View>

              <View style={styles.commentRow}>
                <TextInput
                  placeholder="Add a comment..."
                  value={commentDrafts[item.id] || ""}
                  onChangeText={(value) =>
                    setCommentDrafts((prev) => ({ ...prev, [item.id]: value }))
                  }
                  style={styles.commentInput}
                />
                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => handleComment(item.id)}
                >
                  <Text style={styles.commentButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <BottomNavBar navigation={navigation} />
    </SafeAreaView>
  );
}
