import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getNotifications, markNotificationAsRead } from "../../services/api";

// Helper function to format relative time
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "MEDICINE_REMINDER":
        return "pill";
      case "LOW_STOCK":
        return "alert-circle-outline";
      case "APPOINTMENT_CONFIRMED":
        return "calendar-check";
      case "APPOINTMENT_REMINDER":
        return "calendar-clock";
      case "APPOINTMENT_CANCELLED":
        return "calendar-remove";
      default:
        return "bell-outline";
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => !item.isRead && handleMarkAsRead(item.id)}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getIconForType(item.type)}
            size={24}
            color={!item.isRead ? "#199A8E" : "#94a3b8"}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(item.createdAt))}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#199A8E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-sleep" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>
            You're all caught up! When you receive alerts, they will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#199A8E" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  unreadCard: {
    backgroundColor: "#f0fdfa", // extremely light teal
    borderColor: "#ccfbf1",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#334155",
    marginBottom: 4,
  },
  unreadText: {
    color: "#0f172a",
    fontFamily: "Inter-Bold",
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#94a3b8",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#199A8E",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
});
