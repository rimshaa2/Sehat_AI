import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
} from "react-native";

const ARTICLES = [
  {
    id: "1",
    title: "Understanding high blood pressure",
    source: "WHO",
    url: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
  },
  {
    id: "2",
    title: "Diabetes: symptoms and prevention",
    source: "CDC",
    url: "https://www.cdc.gov/diabetes/basics/diabetes.html",
  },
  {
    id: "3",
    title: "Mental health: stress management basics",
    source: "WHO",
    url: "https://www.who.int/news-room/questions-and-answers/item/stress",
  },
  {
    id: "4",
    title: "Heart disease risk factors",
    source: "CDC",
    url: "https://www.cdc.gov/heartdisease/risk_factors.htm",
  },
];

export default function HealthArticlesScreen({ navigation }: any) {
  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Link unavailable", "Could not open article.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Link unavailable", "Could not open article.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1C2A3A" }}>
          Health Articles
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#199A8E", fontWeight: "700" }}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: "#6B7280", marginTop: 6 }}>
        Verified educational content from trusted medical sources.
      </Text>

      <FlatList
        data={ARTICLES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openUrl(item.url)}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 14,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
              {item.title}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
              Source: {item.source}
            </Text>
            <Text style={{ marginTop: 8, color: "#199A8E", fontWeight: "700" }}>
              Open article
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
