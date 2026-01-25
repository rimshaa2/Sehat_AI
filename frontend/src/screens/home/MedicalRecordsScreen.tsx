import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem
} from "react-native";
import { ChevronLeft, FileText, Download, Plus, Calendar } from "lucide-react-native";
import { fetchMedicalRecords } from '../../services/api'; // 🟢 Import API
import styles from "./styles/MedicalRecordsStyles";

interface MedicalRecord {
  id: string;
  title: string;
  doctor: string;
  date: string;
  type: string;
  color: string;
  iconColor: string;
  details: string;
}

interface NavigationProp {
  goBack: () => void;
}

const FILTERS = ["All", "AI Consultation", "Lab Reports", "Prescriptions"];

export default ({ navigation }: { navigation: NavigationProp }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // 1. Fetch Records on Load
  const loadRecords = async () => {
    setLoading(true);
    try {
      const userId = 1; // 🔴 Replace with actual logged-in User ID
      const data = await fetchMedicalRecords(userId);
      
      // Map DB fields to UI fields if necessary
      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        doctor: item.doctor_name,
        date: new Date(item.record_date).toDateString(),
        type: item.record_type,
        color: item.color_code || '#E0F2FE',
        iconColor: "#3B82F6", // You can make this dynamic based on type
        details: item.details
      }));

      setRecords(formattedData);
    } catch (error) {
      console.error("Failed to load records", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // 2. Filter Logic
  const filteredRecords = selectedFilter === "All" 
    ? records 
    : records.filter(r => r.type === selectedFilter);

  const renderRecordItem: ListRenderItem<MedicalRecord> = ({ item }) => (
    <TouchableOpacity style={styles.recordCard}>
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <FileText size={24} color={item.iconColor} />
      </View>

      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{item.title}</Text>
        <Text style={styles.doctorName}>{item.doctor}</Text>
        
        <View style={styles.metaRow}>
          <Calendar size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.type}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.downloadIcon}>
        <Download size={20} color="#199A8E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Records</Text>
        </View>

        {/* Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Records</Text>
            <Text style={styles.summaryValue}>{records.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Last Consultation</Text>
            <Text style={styles.summarySubValue}>{records[0]?.date || "None"}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentSheet}>
        {/* Filters */}
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {FILTERS.map((filter) => (
                <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, selectedFilter === filter && styles.filterPillActive]}
                onPress={() => setSelectedFilter(filter)}
                >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                    {filter}
                </Text>
                </TouchableOpacity>
            ))}
            </ScrollView>
        </View>

        {/* List */}
        {loading ? (
            <ActivityIndicator size="large" color="#199A8E" style={{marginTop: 50}} />
        ) : (
            <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderRecordItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecords} />}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color:'#999'}}>No records found.</Text>}
            />
        )}
      </View>
    </View>
  );
};